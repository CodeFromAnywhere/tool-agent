import { Endpoint } from "@/client";
import * as client from "@/sdk/client";

import {
  OpenapiDocument,
  getOperationRequestInit,
  getOperations,
  ParsedOperation,
  OpenapiSchemaObject,
  OpenapiSecuritySchemeObject,
} from "openapi-util";

import { resolveSchemaRecursive } from "openapi-util";
import { O, generateRandomString, notEmpty, tryParseJson } from "from-anywhere";

// TODO: abstract away openai
import OpenAI from "openai";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources/index.mjs";

const chatCompletionEndpoint = (context: {
  chatCompletionEndpoint: string;
  chatCompletionAuthToken: string;
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  messages: ChatCompletionMessageParam[];
}) => {
  const { chatCompletionAuthToken, chatCompletionEndpoint, messages, tools } =
    context;
  const openai = new OpenAI({
    apiKey: chatCompletionAuthToken,
  });

  // TODO: rather than using the openai sdk, use 'agentic' or similar: https://github.com/transitive-bullshit/agentic
  return openai.chat.completions.create({
    model: "gpt-4o",
    tools,
    messages,
  });
};

/**

TODO: actually retreive the content-type + content-size + filename + maybe additional metadata, by fetching those headers

so we can do proper filtering, and we can supply the model with this additional information.

 */
const calculateContent = async (message: string, attachmentUrls?: string[]) => {
  let content: ChatCompletionContentPart[] = [{ text: message, type: "text" }];

  if (attachmentUrls && attachmentUrls.length > 0) {
    const imageUrls = attachmentUrls.filter((url) => {
      const imageExtensions = ["jpg", "jpeg", "png", "svg", "gif", "webp"];
      const extension = url.split(".").pop()!;
      const hasImageExtension = imageExtensions.includes(extension);
      return hasImageExtension;
    });

    // NB: attach all attachments as URLs. NB: since this is different from the default functionality of GPT4o, we might expect some slightly different behavior because of this, but in general this makes a lot more tooling possible.
    content.concat({
      type: "text",
      text: `Attachments:\n ${attachmentUrls.join("\n")}`,
    });

    // NB: attach images as attachments (gpt4o specific)
    content = content.concat(
      imageUrls.map((url) => ({ type: "image_url", image_url: { url } })),
    );
  }

  return content;
};

/** Checks the spec and available admin + user details to see if a user has Authorization for an operation  */
export const getOperationAvailable = (context: {
  operationId: string;
  operations: ParsedOperation[];
  /** Ensure the openapi is dereferenced and has a server in `servers` on the root or in the operation. */
  openapi: OpenapiDocument | undefined;
  //tbd via generated types of schemas
  adminOauthDetails: any[];
  userKeys: any[];
  /** sometimes we already have the token */
  openapiAuthToken?: string;
}): {
  isAvailable: boolean;
  message: string;
  loginUrl?: string;
  userSecret?: string;
  operation?: ParsedOperation;
} => {
  const {
    openapi,
    operationId,
    operations,
    adminOauthDetails,
    userKeys,
    openapiAuthToken,
  } = context;

  const operation = operations?.find((x) => x.operationId === operationId);

  if (!operation) {
    // This should never happen, and should be reported somehow
    return {
      isAvailable: false,
      message: "Message llm result: operation not found",
    };
  }

  if (openapiAuthToken) {
    return {
      operation,
      userSecret: openapiAuthToken,
      isAvailable: true,
      message: "Authorized directly",
    };
  }

  const { method, path } = operation;

  const formContext = getFormContextFromOpenapi({
    method,
    path,
    openapi,
  });

  const { servers, parameters, securitySchemes } = formContext;

  //ensure we have a server
  if (!servers || !servers[0]) {
    return { isAvailable: false, message: "No servers" };
  }

  // we have an operation.
  // 1. based on openapi, what appId auth do we need for this operation?

  const security = operation.operation.security || openapi?.security;

  const securityKeys = security?.map((item) => Object.keys(item)).flat();

  const firstKey = securityKeys?.[0];

  const securitySchema = firstKey
    ? (openapi?.components?.securitySchemes?.[firstKey] as
        | OpenapiSecuritySchemeObject
        | undefined)
    : undefined;

  const oauthFlowObject =
    securitySchema && securitySchema.type === "oauth2"
      ? securitySchema.flows?.authorizationCode
      : undefined;

  // based on {firstKey} do we have the clientId/clientSecret in our stored oauth apps?
  const adminOauth = adminOauthDetails.find(
    (x) => x.service === servers?.[0]?.url && x.schemeName === firstKey,
  );

  // if not, we can't login
  if (!adminOauth) {
    return { isAvailable: false, message: "No admin oAuth found" };
  }

  // if we have, does the user have required authorization for this appId+openapi?look in user-details
  const userSecret = userKeys.find(
    (x) => x.clientId === adminOauth.clientId,
  )?.secret;

  // if not,  generate a link

  if (!userSecret) {
    // link from one of these
    oauthFlowObject?.authorizationUrl;
    oauthFlowObject?.tokenUrl;
    oauthFlowObject?.refreshUrl;
    oauthFlowObject?.scopes;

    const loginUrl = undefined;

    return { isAvailable: false, message: "Unauthorized", loginUrl };
  }

  return { isAvailable: true, message: "Authorized", userSecret, operation };
};

/**
 * Sync function that parses a tool to look up its availability and authentication
 */
const parseTool = (
  tool: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
  operations: ParsedOperation[],
  /** Should be dereferenced */
  openapi: OpenapiDocument | undefined,
  openapiAuthToken?: string,
) => {
  const operationId = tool.function.name;

  const { isAvailable, message, loginUrl, userSecret, operation } =
    getOperationAvailable({
      adminOauthDetails: [],
      userKeys: [],
      openapi,
      operationId,
      operations,
      openapiAuthToken,
    });

  const formContext = operation
    ? getFormContextFromOpenapi({
        method: operation.method,
        path: operation.path,
        openapi,
      })
    : undefined;

  // if we do, tool execution is ok

  return {
    tool,
    isAvailable,
    message,
    loginUrl,
    userSecret,
    formContext,
    operation,
  };
};

export const message: Endpoint<"message"> = async (context) => {
  const {
    agentSlug,
    message,
    Authorization,
    attachmentUrls,
    X_AGENT_AUTH_TOKEN,
    threadId,
    disableHistory,
  } = context;
  const userAuthToken = Authorization?.slice("Bearer ".length);

  const result = await client.migrateAgentOpenapi("read", {
    rowIds: [agentSlug],
  });
  const agent = result.items?.[agentSlug];

  if (!agent) {
    return {
      isSuccessful: false,
      message: `Couldn't find agent agentSlug:${agentSlug}`,
    };
  }

  if (!agent.adminAuthToken) {
    return {
      isSuccessful: false,
      message: `Couldn't find admintoken. agentSlug:${agentSlug}`,
    };
  }

  const isInvalidAuthorization =
    !userAuthToken || userAuthToken.length < 64 || userAuthToken.length > 128;

  const userResult = !isInvalidAuthorization
    ? (await client.migrateAgentUser("read", { rowIds: [userAuthToken] }))
        .items?.[userAuthToken]
    : undefined;

  const newAuthToken = !userResult ? generateRandomString(64) : undefined;

  if (newAuthToken) {
    // sign up
    console.log("sign up");
    await client.migrateAgentUser("update", {
      id: newAuthToken,
      partialItem: { threadIds: [], keys: [] },
    });
  }

  if (agent.agentAuthToken !== X_AGENT_AUTH_TOKEN) {
    return {
      isSuccessful: false,
      message: "Unauthorized: Invalid agent token.",
      status: 403,
    };
  }

  const adminResult = (
    await client.migrateAgentAdmin("read", { rowIds: [agent.adminAuthToken] })
  )?.items?.[agent.adminAuthToken];

  if (!adminResult) {
    return {
      isSuccessful: false,
      message: "Unauthorized. Couldn't find admin.",
    };
  }

  const aThreadId = threadId;

  // user tool auth info
  const userDetails = userResult?.keys;

  // admin tool auth info
  const { agentSlugs } = adminResult;

  // this should move to admin, right?
  const { instructions, model, openapiUrl, openapiAuthToken } = agent;

  const agentUserThreadResult =
    aThreadId && !disableHistory
      ? await client.migrateAgentUserThread("read", { rowIds: [aThreadId] })
      : undefined;

  // NB: if we have a thread with messages already, use that, otherwise, start with the system prompt
  const threadItem = aThreadId
    ? agentUserThreadResult?.items?.[aThreadId]
    : undefined;

  const thread: ChatCompletionMessageParam[] =
    (threadItem?.messages as ChatCompletionMessageParam[]) || [
      { role: "system", content: instructions },
    ];
  // NB: simply add the message to the thread. We now have our starting point.
  const threadWithRequest = thread.concat({
    content: await calculateContent(message, attachmentUrls),
    role: "user",
  });

  // NB: it's probably faster if the openapi is already dereferenced in the first place, but we still do it just in case.
  const dereferencedOpenapi = openapiUrl
    ? ((await resolveSchemaRecursive({
        documentUri: openapiUrl,
        shouldDereference: true,
      })) as OpenapiDocument | undefined)
    : undefined;

  if (openapiUrl && !dereferencedOpenapi) {
    return { isSuccessful: false, message: "Couldn't find OpenAPI" };
  }

  const operations = dereferencedOpenapi
    ? await getOperations(dereferencedOpenapi)
    : [];

  if (!operations) {
    return { isSuccessful: false, message: "Couldn't find operations" };
  }

  const tools = operations
    .map((item) => {
      const parameterProperties = item.parameters?.reduce(
        (previous, current) => ({
          ...previous,
          [current.name]: current.schema as OpenapiSchemaObject | undefined,
        }),
        {} as { [key: string]: OpenapiSchemaObject | undefined },
      );

      const parameterSchema = parameterProperties
        ? { type: "object", properties: parameterProperties }
        : undefined;

      // NB: Merge schemas if they are both objects
      // this may not be sufficient for every api, incase it requires non-objects as input.
      const fullSchema =
        parameterSchema &&
        item.resolvedRequestBodySchema &&
        item.resolvedRequestBodySchema.type === "object"
          ? {
              ...item.resolvedRequestBodySchema,
              properties: {
                ...(item.resolvedRequestBodySchema.properties || {}),
                ...parameterSchema.properties,
              },
            }
          : item.resolvedRequestBodySchema || parameterSchema;

      return {
        type: "function",
        function: {
          name: item.operationId,
          description: item.operation.description,

          parameters: fullSchema,
        },
      } as ChatCompletionTool;
    })
    .filter(notEmpty);

  console.dir({ tools }, { depth: 599 });
  let messages: ChatCompletionMessageParam[] = [...threadWithRequest];

  //console.log({ messages });

  const completion = await chatCompletionEndpoint({
    tools,
    messages,
    chatCompletionEndpoint: "https://api.openai.com/chat/completion",
    chatCompletionAuthToken: agent.openaiSecretKey,
  });

  let completionMessage = completion.choices[0]?.message;

  // console.log({ completionMessage });

  if (!completionMessage) {
    return { isSuccessful: false, message: "No response" };
  }

  messages.push(completionMessage);

  /*
  ## oAuth tool use
    - For every "tool_call", look up if we have the required user-based authorization.
    - If not, don't reply with "tool" but reply with "assistant" with a message with a login-link.
    - The user logging in will trigger a callback which should be able to add the authorization to the user under the proper `securitySchemeKey`
    */
  // perform all actions

  if (completionMessage.tool_calls) {
    while (completionMessage.tool_calls) {
      const parsedTools = completionMessage.tool_calls
        .map((tool) =>
          parseTool(tool, operations, dereferencedOpenapi, openapiAuthToken),
        )
        .filter(notEmpty);
      // console.log("TOOLCALL REQ:", completionMessage.tool_calls, {
      //   parsedTools,
      // });

      const unavailableTools = parsedTools.filter((x) => !x.isAvailable);

      if (unavailableTools.length > 0) {
        // one or more tools aren't available. Let's get login link(s).

        const unavailableMessages = [
          ...completionMessage.tool_calls.map((tool) => ({
            tool_call_id: tool.id,
            role: "tool" as "tool",
            content: "{}",
          })),
          {
            role: "assistant" as "assistant",
            content: `You don't have access to all required tools. Please login. (URL COMING SOON)`,
          },
        ];

        // console.log("Unavailable tools", {
        //   unavailableTools,
        //   unavailableMessages,
        // });

        messages = messages.concat(unavailableMessages);
        // 'break' with a new completionMessage without tool_calls will force the while loop to stop.
        break;
      }

      // By now, this should be all tools; they should all be available at this point.
      const availableTools = parsedTools.filter((x) => x.isAvailable);
      // console.log({
      //   toolcallsN: completionMessage.tool_calls.length,
      //   parsedToolsN: parsedTools.length,
      // });
      const toolOutputs = (
        await Promise.all(
          availableTools.map(async (item) => {
            const {
              tool,
              isAvailable,
              message,
              formContext,
              loginUrl,
              userSecret,
              operation,
            } = item;
            //url, fetchRequestInit, bodyData

            if (!operation || !formContext) {
              console.log("available tool without operation or formContext", {
                tool,
                isAvailable,
                operation,
                formContext,
              });
              return;
            }
            const bodyData = tryParseJson<O>(tool.function.arguments);

            const data = {
              httpBearerToken: userSecret,
              ...bodyData,
            };

            const { method, path } = operation;
            const { parameters, servers, securitySchemes } = formContext;

            if (!servers || !servers[0]) {
              // must have server
              console.log("no sever for ", tool);
              return;
            }

            const { fetchRequestInit, url } = getOperationRequestInit({
              path,
              method,
              servers,
              data,
              parameters,
              securitySchemes,
            });

            console.log("CALLING", { url, fetchRequestInit });
            const response = await fetch(url!, fetchRequestInit)
              .then(async (response) => {
                const text = await response.text();
                return text;
              })
              .catch((e) => {
                console.log(e);
              });

            const content = response || "ERROR (no response)";

            const toolMessage: ChatCompletionToolMessageParam = {
              tool_call_id: tool.id,
              role: "tool",
              content,
            };

            return toolMessage;
          }),
        )
      ).filter(notEmpty);

      messages = messages.concat(toolOutputs);

      // console.log({ toolOutputs }, "Messages with tool outputs");
      //console.dir({ messages }, { depth: 5 });
      const completion = await chatCompletionEndpoint({
        tools,
        messages,
        chatCompletionEndpoint: "https://api.openai.com/chat/completion",
        chatCompletionAuthToken: agent.openaiSecretKey,
      });

      completionMessage = completion.choices[0]?.message;

      messages.push(completionMessage);
    }
  }

  //////DONE WITH THE TOOLCALL LOOP!\\\\\\\

  // Last step: Add messages to the thread
  const randomThreadId = generateRandomString(64);
  const finalThreadId = aThreadId || randomThreadId;

  // TODO: can be done in a 'waitUntil'
  const promises = await Promise.all([
    !aThreadId
      ? client.migrateAgentUser("update", {
          id: userAuthToken,
          partialItem: {
            // add thread
            threadIds: (userResult?.threadIds || []).concat([randomThreadId]),
          },
        })
      : undefined,
    client.migrateAgentUserThread("update", {
      id: finalThreadId,
      partialItem: { messages: messages as any, agentSlug },
    }),
  ]);

  //console.log({ promises });

  const responseMessages = messages.slice(threadWithRequest.length) as any;

  console.dir({ responseMessages }, { depth: 5 });
  const response = {
    isSuccessful: true,
    threadId: finalThreadId,
    // NB: return only the responses
    messages: responseMessages,
  };

  if (newAuthToken) {
    (response as any).newAuthToken = newAuthToken;
  }

  return response;
};
