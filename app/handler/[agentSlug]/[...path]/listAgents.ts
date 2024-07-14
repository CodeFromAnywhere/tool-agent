import { Endpoint } from "@/client";
import * as client from "@/sdk/client";
import { mapValuesSync } from "from-anywhere";

export const listAgents: Endpoint<"listAgents"> = async (context) => {
  const { Authorization } = context;
  const adminAuthToken = Authorization?.slice("Bearer ".length);

  if (!adminAuthToken || adminAuthToken.length < 64) {
    return { isSuccessful: false, message: "Unauthorized", status: 403 };
  }

  const readAgentAdminResult = await client.migrateAgentAdmin("read", {
    rowIds: [adminAuthToken],
  });

  const agentSlugs = readAgentAdminResult.items?.[adminAuthToken]?.agentSlugs;

  if (!agentSlugs) {
    return { isSuccessful: false, message: readAgentAdminResult.message };
  }

  const agentOpenapiResult = await client.migrateAgentOpenapi("read", {
    rowIds: agentSlugs,
  });

  if (!agentOpenapiResult.items) {
    return { isSuccessful: false, message: agentOpenapiResult.message };
  }

  return {
    isSuccessful: true,
    items: mapValuesSync(agentOpenapiResult.items, (x) => {
      if (!x) {
        return;
      }
      // don't include admin authtoken in response
      const { adminAuthToken, ...rest } = x;
      return rest;
    }),
  };
};
