import * as client from "@/sdk/client";
import { Endpoint } from "@/client";
import { generateRandomString, onlyUnique2 } from "from-anywhere";

export const upsertToolAgent: Endpoint<"upsertToolAgent"> = async (context) => {
  const { Authorization, agentSlug, agentAuthToken, ...rest } = context;
  const adminAuthToken = Authorization?.slice("Bearer ".length);

  const realAgentAuthToken =
    !agentAuthToken || agentAuthToken.length < 64
      ? generateRandomString(64)
      : agentAuthToken;

  const alreadyResult = await client.migrateAgentOpenapi("read", {
    rowIds: [agentSlug],
  });

  if (!alreadyResult.isSuccessful) {
    return {
      isSuccessful: false,
      message: "Couldn't read AgentOpenapi crud:" + alreadyResult.message,
    };
  }
  const already = alreadyResult.items?.[agentSlug];

  if (
    already &&
    already.adminAuthToken &&
    already.adminAuthToken !== adminAuthToken
  ) {
    return {
      isSuccessful: false,
      message: `Unauthorized for slug '${agentSlug}'. Incorrect authToken`,
    };
  }

  const realAdminAuthToken =
    adminAuthToken && adminAuthToken.length >= 64
      ? adminAuthToken
      : generateRandomString(64);

  const partialItem = {
    agentSlug: agentSlug,
    agentAuthToken: realAgentAuthToken,
    adminAuthToken: realAdminAuthToken,
    ...rest,
  };

  const agentSlugs = (
    await client.migrateAgentAdmin("read", { rowIds: [realAdminAuthToken] })
  ).items?.[realAdminAuthToken]?.agentSlugs;

  const newAgentSlugs = (agentSlugs || [])
    .concat(agentSlug)
    .filter(onlyUnique2());

  // let's not take to long.
  const [updatedAgent, updatedAdmin] = await Promise.all([
    client.migrateAgentOpenapi("update", { id: agentSlug, partialItem }),
    // at least create it, don't need to set stuff here.
    // an idea would be to also add the created agent to openapis...?
    client.migrateAgentAdmin("update", {
      id: realAdminAuthToken,
      partialItem: { agentSlugs: newAgentSlugs },
    }),
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
