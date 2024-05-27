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

  // use the client and store from your api every time you hit refresh.

  // Agents need to be stored:
  // - key: agentSlug
  // - value:{openaiSecretKey,authToken,assistant,metadata}

  return {
    isSuccessful: true,
    message: `Found ${assistants.length} assistants`,
    result: assistants,
  };
};
