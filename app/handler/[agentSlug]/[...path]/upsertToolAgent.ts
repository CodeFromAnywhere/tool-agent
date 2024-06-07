import { agentOpenapi } from "@/crud-client";
import { Endpoint } from "@/client";
// import OpenAI from "openai";
import { generateRandomString } from "from-anywhere";

export const upsertToolAgent: Endpoint<"upsertToolAgent"> = async (context) => {
  const { adminAuthToken, agentSlug, ...rest } = context;

  const { authToken } = rest;
  const realAgentSlug = agentSlug.toLowerCase();
  const realAuthToken =
    !authToken || authToken.length < 32 ? generateRandomString(32) : authToken;

  const already = (await agentOpenapi("read", { rowIds: [realAgentSlug] }))
    .items?.[agentSlug];

  if (
    already &&
    already.adminAuthToken &&
    already.adminAuthToken !== adminAuthToken
  ) {
    return {
      isSuccessful: false,
      message: `Unauthorized`,
    };
  }

  // const openai = new OpenAI({
  //   apiKey: openaiSecretKey,
  // });

  const partialItem = {
    agentSlug: realAgentSlug,
    authToken: realAuthToken,
    adminAuthToken:
      adminAuthToken && adminAuthToken.length >= 32
        ? adminAuthToken
        : generateRandomString(32),
    ...rest,
  };

  const updated = await agentOpenapi("update", { id: agentSlug, partialItem });

  if (!updated.isSuccessful) {
    return { isSuccessful: false, message: updated.message };
  }

  return {
    isSuccessful: true,
    message: `Upserted ${agentSlug}`,
    result: partialItem,
  };
};
