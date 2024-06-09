import { Endpoint } from "@/client";
import { agentOpenapi } from "@/crud-client";
import OpenAI from "openai";
import {
  OpenapiDocument,
  getFormContextFromOpenapi,
  getOperationRequestInit,
} from "openapi-util";
import { resolveSchemaRecursive } from "openapi-util/build/resolveSchemaRecursive";
import { getOperations } from "openapi-util/build/getOperations";
import { O, notEmpty, tryParseJson } from "from-anywhere";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources/index.mjs";

export const message: Endpoint<"message"> = async (context) => {
  const { agentSlug, message, Authorization, attachmentUrls } = context;

  const result = await agentOpenapi("read", { rowIds: [agentSlug] });
  const agent = result.items?.[agentSlug];

  console.log({ agent, Authorization });
  if (
    !agent ||
    !Authorization ||
    Authorization !== `Bearer ${agent.authToken}`
  ) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

  const openaiSecretKey = agent.openaiSecretKey;

  const openai = new OpenAI({
    apiKey: openaiSecretKey,
  });

  const {
    instructions,
    model,
    openapiUrl,
    openapiAuthToken,
    temperature,
    top_p,
  } = agent;

  const dereferenced = openapiUrl
    ? ((await resolveSchemaRecursive({
        documentUri: openapiUrl,
        shouldDereference: true,
      })) as OpenapiDocument | undefined)
    : undefined;

  if (openapiUrl && !dereferenced) {
    return { isSuccessful: false, message: "Couldn't find OpenAPI" };
  }

  const operations = dereferenced
    ? await getOperations(dereferenced)
    : undefined;

  // @ts-ignore
  const tools: ChatCompletionTool[] | undefined = operations
    ?.map((item) => ({
      type: "function",
      function: {
        name: item.id,
        description: item.operation.description,
        parameters: item.resolvedRequestBodySchema,
      },
    }))
    .filter(notEmpty);

  let content: ChatCompletionContentPart[] = [{ text: message, type: "text" }];

  if (attachmentUrls) {
    // NB: attach attachments
    content = content.concat(
      attachmentUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    );
  }

  let messages: ChatCompletionMessageParam[] = [
    { role: "system", content: instructions },
    { content, role: "user" },
  ];

  const completion = await openai.chat.completions.create({
    model: model || "gpt-4o",
    tools,
    messages,
    temperature,
    top_p,
  });

  let completionMessage = completion.choices[0]?.message;

  if (!completionMessage) {
    return { isSuccessful: false, message: "No response" };
  }

  messages.push(completionMessage);

  // perform all actions
  while (completionMessage.tool_calls) {
    console.log("TOOLCALL REQ:", completionMessage.tool_calls);
    const tool_outputs = (
      await Promise.all(
        completionMessage.tool_calls.map(async (tool) => {
          // TODO: run `tool.function.name` with proper arguments
          const operationId = tool.function.name;
          const operation = operations?.find((x) => x.id === operationId);
          if (!operation) {
            return;
          }

          const { method, path } = operation;
          const formContext = getFormContextFromOpenapi({
            //@ts-ignore

            method,
            path,
            openapi: dereferenced,
          });
          const { parameters, servers, securitySchemes } = formContext;

          const bodyData = tryParseJson<O>(tool.function.arguments);

          const data = {
            httpBearerToken:
              openapiAuthToken === "" ? undefined : openapiAuthToken,
            ...bodyData,
          };

          const { fetchRequestInit, url } = getOperationRequestInit({
            path,
            method,
            //@ts-ignore
            servers,
            data,
            parameters,
            securitySchemes,
          });

          const response = await fetch(url, fetchRequestInit)
            .then(async (response) => {
              const text = await response.text();
              return text;
            })
            .catch((e) => {
              console.log(e);
            });

          // TODO: check how to call an operation with parameters, also providing Auth. See 'openapi-form'

          return {
            tool_call_id: tool.id,
            role: "tool",
            content: response || "ERROR (no response)",
          } satisfies ChatCompletionToolMessageParam;
        }),
      )
    ).filter(notEmpty);

    messages = messages.concat(tool_outputs);

    console.log({ messages });

    const completion = await openai.chat.completions.create({
      model: model || "gpt-4o",
      tools,
      messages,
      temperature,
      top_p,
    });

    completionMessage = completion.choices[0]?.message;

    messages.push(completionMessage);
  }

  // 'completion' is not needing tool_calls anymore

  const responses = messages.slice(2);

  return { isSuccessful: true, message: "Responded", messages: responses };
};
