import { Endpoint } from "@/client";
import * as client from "@/sdk/client";

import {
  OpenapiDocument,
  getFormContextFromOpenapi,
  getOperationRequestInit,
  getOperations,
  ParsedOperation,
} from "openapi-util";
import { resolveSchemaRecursive } from "openapi-util/build/resolveSchemaRecursive";
import { O, generateRandomString, notEmpty, tryParseJson } from "from-anywhere";

// TODO: abstract away openai
import OpenAI from "openai";
import {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionToolMessageParam,
} from "openai/resources/index.mjs";
import { SecuritySchemeObject } from "openapi-typescript";

const chatCompletionEndpoint = (context: {
  chatCompletionEndpoint: string;
  chatCompletionAuthToken: string;
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  messages: ChatCompletionMessageParam[];
}) => {
  const { chatCompletionAuthToken, chatCompletionEndpoint, messages, tools } =
    context;
  const openai = new OpenAI({ apiKey: chatCompletionAuthToken });

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
}): {
  isAvailable: boolean;
  message: string;
  loginUrl?: string;
  userSecret?: string;
  operation?: ParsedOperation;
} => {
  const { openapi, operationId, operations, adminOauthDetails, userKeys } =
    context;

  const operation = operations?.find((x) => x.id === operationId);

  if (!operation) {
    // This should never happen, and should be reported somehow
    return {
      isAvailable: false,
      message: "Message llm result: operation not found",
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
        | SecuritySchemeObject
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
  operations: ParsedOperation[] | undefined,
  /** Should be dereferenced */
  openapi: OpenapiDocument | undefined,
) => {
  const operationId = tool.function.name;

  if (!operations) {
    return;
  }
  const { isAvailable, message, loginUrl, userSecret, operation } =
    getOperationAvailable({
      adminOauthDetails: [],
      userKeys: [],
      openapi,
      operationId,
      operations,
    });

  if (!operation) {
    return;
  }

  const { method, path } = operation;

  const formContext = getFormContextFromOpenapi({
    method,
    path,
    openapi,
  });

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

  const validAuthorization =
    !userAuthToken || userAuthToken.length < 64 || userAuthToken.length > 128;

  const userResult = validAuthorization
    ? (await client.migrateAgentUser("read", { rowIds: [userAuthToken] }))
        .items?.[userAuthToken]
    : undefined;

  const newAuthToken = !userResult ? generateRandomString(64) : undefined;

  if (newAuthToken) {
    // sign up
    await client.migrateAgentUser("update", {
      id: newAuthToken,
      partialItem: {},
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

  const firstThreadId = userResult?.threadIds?.[0];

  const aThreadId = threadId || firstThreadId;

  // user tool auth info
  const userDetails = userResult?.keys;

  // admin tool auth info
  const { agentSlugs } = adminResult;

  // this should move to admin, right?
  const { instructions, model, openapiUrl } = agent;

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
    : undefined;

  const tools = operations
    ?.map(
      (item) =>
        ({
          type: "function",
          function: {
            name: item.id,
            description: item.operation.description,
            parameters: item.resolvedRequestBodySchema,
          },
        }) as ChatCompletionTool,
    )
    .filter(notEmpty);

  let messages: ChatCompletionMessageParam[] = threadWithRequest;

  const completion = await chatCompletionEndpoint({
    tools,
    messages,
    chatCompletionEndpoint: "https://api.openai.com/chat/completion",
    chatCompletionAuthToken: agent.openaiSecretKey,
  });

  let completionMessage = completion.choices[0]?.message;

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
      // console.log("TOOLCALL REQ:", completionMessage.tool_calls);

      const parsedTools = completionMessage.tool_calls
        .map(
          // TODO: break this up into preparation + auth-step, and execution.
          (tool) => parseTool(tool, operations, dereferencedOpenapi),
        )
        .filter(notEmpty);

      const unavailableTools = parsedTools.filter((x) => !x.isAvailable);

      if (unavailableTools.length > 0) {
        // one or more tools aren't available. Let's get login link(s).

        completionMessage = {
          role: "assistant",
          content: `You don't have access to all required tools. Please login. (URL COMING SOON)`,
        };
        // 'break' with a new completionMessage without tool_calls will force the while loop to stop.
        break;
      }

      // By now, this should be all tools; they should all be available at this point.
      const availableTools = parsedTools.filter((x) => x.isAvailable);

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

            const bodyData = tryParseJson<O>(tool.function.arguments);

            const data = {
              // TODO: to be found in user creds
              httpBearerToken: userSecret,
              ...bodyData,
            };

            const { method, path } = operation;
            const { parameters, servers, securitySchemes } = formContext;

            if (!servers || !servers[0]) {
              // must have server
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

      console.log("Messages with tool outputs", { messages });

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
  await Promise.all([
    !aThreadId
      ? client.migrateAgentUser("update", {
          id: userAuthToken,
          partialItem: {
            threadIds: (userResult?.threadIds || []).concat([randomThreadId]),
          },
        })
      : undefined,
    client.migrateAgentUserThread("update", {
      id: finalThreadId,
      partialItem: { messages: messages as any, agentSlug },
    }),
  ]);

  return {
    isSuccessful: true,
    message: "Responded",
    threadId: finalThreadId,
    newAuthToken,
    // NB: return only the responses
    messages: messages.slice(threadWithRequest.length) as any,
  };
};
