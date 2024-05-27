import { Endpoint } from "@/client";
import OpenAI from "openai";

export const refreshOpenai: Endpoint<"refreshOpenai"> = async (context) => {
  const { openaiSecretKey } = context;

  const openai = new OpenAI({
    apiKey: openaiSecretKey,
  });

  let assistantsPage = await openai.beta.assistants.list({ limit: 100 });
  let assistants = assistantsPage.data;

  let hasMore = true;
  while (hasMore) {
    hasMore = assistantsPage.hasNextPage();
    if (!hasMore) {
      break;
    } else {
      assistantsPage = await assistantsPage.getNextPage();
      assistants = assistants.concat(assistantsPage.data);
    }
  }

  // 1 - make AgentOpenapi item and create crud-openapi at https://data.actionschema.com/agent-openapi/openapi.json

  // 2 - create npm script that turns the above openapi into an SDK client

  // 3 - use the client and store from your api every time you hit refresh.

  // Agents need to be stored:
  // - key: agentSlug
  // - value:{openaiSecretKey,authToken,assistant,metadata}

  return {
    isSuccessful: true,
    message: `Found ${assistants.length} assistants`,
    result: assistants,
  };
};
