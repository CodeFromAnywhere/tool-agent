import { Endpoint } from "@/client";
import * as client from "@/sdk/client";

export const listAgents: Endpoint<"listAgents"> = async (context) => {
  const { Authorization } = context;
  const adminAuthToken = Authorization?.slice("Bearer ".length);

  if (!adminAuthToken || adminAuthToken.length < 64) {
    return { isSuccessful: false, message: "Unauthorized", status: 403 };
  }

  const agentSlugs =
    (await client.migrateAgentAdmin("read", { rowIds: [adminAuthToken] }))
      .items?.[adminAuthToken]?.agentSlugs || [];

  return {
    isSuccessful: true,
    agents: agentSlugs?.map((agentSlug) => ({ agentSlug })),
  };
};
