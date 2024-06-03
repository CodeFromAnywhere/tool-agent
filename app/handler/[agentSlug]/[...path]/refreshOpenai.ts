import { agentOpenapi } from "@/crud-client";
import { Endpoint } from "@/client";
import OpenAI from "openai";
import { AgentOpenapiSchema } from "@/schemas/agent-openapi.schema";
import { OpenaiAssistantSchema } from "@/schemas/openai-assistant.schema";
import { hashCode } from "from-anywhere";

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
  const items: AgentOpenapiSchema[] = assistants.map((item) => {
    return {
      __id: item.id,
      agentSlug: item.id,
      assistant: item as OpenaiAssistantSchema,
      authToken: `t${hashCode(openaiSecretKey)}`,
      openaiSecretKey,
      metadata: {},
    };
  });

  // Agents need to be stored:
  const created = await agentOpenapi("create", { items });

  console.log({ items, created });
  return {
    isSuccessful: true,
    message: `Found ${assistants.length} assistants`,
    result: items,
  };
};
