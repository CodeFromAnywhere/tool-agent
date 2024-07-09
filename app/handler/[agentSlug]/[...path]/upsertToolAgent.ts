import { agentAdmin, agentOpenapi } from "@/sdk/client";
import { Endpoint } from "@/client";
import { generateRandomString } from "from-anywhere";

export const upsertToolAgent: Endpoint<"upsertToolAgent"> = async (context) => {
  const { adminAuthToken, agentSlug, agentAuthToken, ...rest } = context;

  const realAgentSlug = agentSlug.toLowerCase();
  const realAuthToken =
    !agentAuthToken || agentAuthToken.length < 64
      ? generateRandomString(64)
      : agentAuthToken;

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

  const realAdminAuthToken =
    adminAuthToken && adminAuthToken.length >= 64
      ? adminAuthToken
      : generateRandomString(64);

  const partialItem = {
    agentSlug: realAgentSlug,
    agentAuthToken: realAuthToken,
    adminAuthToken: realAdminAuthToken,
    ...rest,
  };

  // let's not take to long.
  const [_, updatedAgent] = await Promise.all([
    agentOpenapi("update", { id: agentSlug, partialItem }),
    // at least create it, don't need to set stuff here.
    // an idea would be to also add the created agent to openapis...?
    agentAdmin("update", { id: realAdminAuthToken!, partialItem: {} }),
  ]);

  if (!updatedAgent.isSuccessful) {
    return { isSuccessful: false, message: updatedAgent.message };
  }

  return {
    isSuccessful: true,
    message: `Upserted ${agentSlug}`,
    result: partialItem,
  };
};
