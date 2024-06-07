import { agentOpenapi } from "@/crud-client";
import { Endpoint } from "@/client";
import OpenAI from "openai";
import { AgentOpenapiSchema } from "@/schemas/agent-openapi.schema";
import { OpenaiAssistantSchema } from "@/schemas/openai-assistant.schema";
import { hashCode } from "from-anywhere";

export const refreshOpenai: Endpoint<"createAgent"> = async (context) => {
  const {
    openaiSecretKey,
    agentSlug,
    instructions,
    authToken,
    deepgramToken,
    model,
    openapiAuthToken,
    openapiUrl,
    temperature,
    top_p,
  } = context;

  const openai = new OpenAI({
    apiKey: openaiSecretKey,
  });

  // Agents need to be stored:
  const created = await agentOpenapi("create", { items });

  if (!created.isSuccessful) {
    return { isSuccessful: false, message: created.message };
  }

  return {
    isSuccessful: true,
    message: `Found ${assistants.length} assistants`,
    result: items,
  };
};
