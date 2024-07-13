import { Endpoint } from "@/client";
import * as client from "@/sdk/client";

/** Ugh... lot of work to make such an endpoint that should've been super simple :( */
export const removeAgent: Endpoint<"removeAgent"> = async (context) => {
  const { rowIds, Authorization } = context;
  const adminAuthToken = Authorization?.slice("Bearer ".length);

  if (!adminAuthToken || !rowIds || rowIds.length === 0) {
    return {
      isSuccessful: false,
      message: `Please provide some ids to delete`,
      status: 422,
    };
  }
  const result = await client.migrateAgentOpenapi("read", {
    rowIds,
  });

  if (!result.items) {
    return {
      isSuccessful: false,
      message: `Couldn't find agents`,
      status: 404,
    };
  }

  const agentKeys = Object.keys(result.items);

  if (agentKeys.length === 0) {
    return {
      isSuccessful: false,
      message: `No agents found`,
      status: 404,
    };
  }

  if (
    agentKeys.find(
      (key) => result.items![key]?.adminAuthToken !== adminAuthToken,
    )
  ) {
    // one of the agents isn't authorizable
    return {
      isSuccessful: false,
      message: `Unauthorized`,
      status: 403,
    };
  }
  const agentSlugs = (
    await client.migrateAgentAdmin("read", { rowIds: [adminAuthToken] })
  ).items?.[adminAuthToken]?.agentSlugs;

  const newAgentSlugs = (agentSlugs || []).filter(
    (slug) => !rowIds.includes(slug),
  );

  // let's not take to long.
  const [removeAgentOpenapi, updatedAgentAdmin] = await Promise.all([
    client.migrateAgentOpenapi("remove", { rowIds }),
    // at least create it, don't need to set stuff here.
    // an idea would be to also add the created agent to openapis...?
    client.migrateAgentAdmin("update", {
      id: adminAuthToken,
      partialItem: { agentSlugs: newAgentSlugs },
    }),
  ]);

  if (!removeAgentOpenapi.isSuccessful || !updatedAgentAdmin.isSuccessful) {
    return { isSuccessful: false, removeAgentOpenapi, updatedAgentAdmin };
  }

  return { isSuccessful: true, message: "Removed" };
};
