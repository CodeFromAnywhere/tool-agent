import { agentAdmin, agentOpenapi } from "@/sdk/client";
import { Endpoint } from "@/client";
import { generateRandomString } from "from-anywhere";

export const upsertToolAgent: Endpoint<"upsertToolAgent"> = async (context) => {
  const { adminAuthToken, agentSlug, agentAuthToken, ...rest } = context;

  // no transformation
  const realAgentSlug = agentSlug;

  const realAgentAuthToken =
    !agentAuthToken || agentAuthToken.length < 64
      ? generateRandomString(64)
      : agentAuthToken;

  const alreadyResult = await agentOpenapi("read", { rowIds: [realAgentSlug] });

  if (!alreadyResult.isSuccessful) {
    return { isSuccessful: false, message: "Couldn't read AgentOpenapi crud" };
  }
  const already = alreadyResult.items?.[realAgentSlug];

  if (
    already &&
    already.adminAuthToken &&
    already.adminAuthToken !== adminAuthToken
  ) {
    return {
      isSuccessful: false,
      message: `Unauthorized for slug '${realAgentSlug}'. Incorrect authToken`,
    };
  }

  const realAdminAuthToken =
    adminAuthToken && adminAuthToken.length >= 64
      ? adminAuthToken
      : generateRandomString(64);

  const partialItem = {
    agentSlug: realAgentSlug,
    agentAuthToken: realAgentAuthToken,
    adminAuthToken: realAdminAuthToken,
    ...rest,
  };

  // let's not take to long.
  const [updatedAgent, updatedAdmin] = await Promise.all([
    agentOpenapi("update", { id: realAgentSlug, partialItem }),
    // at least create it, don't need to set stuff here.
    // an idea would be to also add the created agent to openapis...?
    agentAdmin("update", { id: realAdminAuthToken, partialItem: {} }),
  ]);

  if (!updatedAgent.isSuccessful) {
    // to be done
    return {
      isSuccessful: false,
      message: `Failed updating agent:${updatedAgent.message}`,
    };
  }
  if (!updatedAdmin.isSuccessful) {
    // to be done
    return {
      isSuccessful: false,
      message: `Failed updating admin:${updatedAdmin.message}`,
    };
  }

  return {
    isSuccessful: true,
    message: `Upserted ${agentSlug}`,
    result: partialItem,
  };
};
