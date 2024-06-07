import { Endpoint } from "@/client";
import { agentOpenapi } from "@/crud-client";
import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages.mjs";
import { OpenapiDocument } from "openapi-util";
import { resolveSchemaRecursive } from "openapi-util/build/resolveSchemaRecursive";
import { getOperations } from "openapi-util/build/getOperations";
import { notEmpty } from "from-anywhere";

export const message: Endpoint<"message"> = async (context) => {
  const { agentSlug, message, Authorization } = context;

  const result = await agentOpenapi("read", { rowIds: [agentSlug] });
  const agent = result.items?.[agentSlug];

  if (!agent || !Authorization || Authorization !== agent.authToken) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

  const openaiSecretKey = agent.openaiSecretKey;

  const openai = new OpenAI({
    apiKey: openaiSecretKey,
  });

  // const assistant = await openai.beta.assistants.retrieve(agentSlug);

  // if (!assistant) {
  //   return { isSuccessful: false, message: "Assistant invalid" };
  // }

  const thread = await openai.beta.threads.create({
    messages: [{ content: message, role: "user" }],
  });

  const openaiMessage = await openai.beta.threads.messages.create(thread.id, {
    content: message,
    role: "user",
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
  const tools: OpenAI.Beta.Assistants.AssistantTool[] | undefined = operations
    ?.map((item) => ({
      type: "function",
      function: {
        name: item.id,
        description: item.operation.description,
        parameters: item.resolvedRequestBodySchema,
      },
    }))
    .filter(notEmpty);

  let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    instructions,
    model,
    //@ts-ignore
    assistant_id: undefined,
    temperature,
    top_p,
    tools,
  });

  // perform all actions
  while (run.status === "requires_action" && run.required_action) {
    const tool_outputs =
      await run.required_action.submit_tool_outputs.tool_calls.map((tool) => {
        // TODO: run `tool.function.name` with proper arguments

        return {
          tool_call_id: tool.id,
          output: '{ isSuccessful: false, message: "TBD" }',
        };
      });

    run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
      thread.id,
      run.id,
      {
        tool_outputs,
        stream: false,
      },
    );
  }

  // 'run' is not requires_action anymore

  const messages = await openai.beta.threads.messages.list(thread.id);

  // TODO: only get the required messages
  console.log({
    messages: messages.data.map((x) =>
      x.content.map((x) => (x.type === "text" ? x.text.value : x)),
    ),
  });
  const responseMessageItem = messages.data.shift();

  const responseMessage = (
    responseMessageItem?.content?.find((x) => x.type === "text") as
      | TextContentBlock
      | undefined
  )?.text?.value;

  if (!responseMessage) {
    return { isSuccessful: false, message: "Couldn't get message back" };
  }

  return { isSuccessful: true, message: responseMessage };
};
