import { Endpoint, ResponseType } from "@/client";
import * as client from "@/sdk/client";

export const renderAgentDetails: Endpoint<"renderAgentDetails"> = async (
  context,
) => {
  const { agentSlug } = context;

  // NB: no auth needed for this endpoint.

  if (!agentSlug) {
    return {
      isSuccessful: false,
      message: "No slug",
    };
  }

  const details = (
    await client.migrateAgentOpenapi("read", {
      rowIds: [agentSlug.toLowerCase()],
    })
  ).items?.[agentSlug];

  if (!details) {
    return {
      isSuccessful: false,
      message: "Couldn't find details for agent " + agentSlug,
    };
  }

  console.log({ details });
  if (
    !details.adminAuthToken // &&
    // details.adminAuthToken.length >= 32 &&
    // `Bearer ${details.adminAuthToken}` !== Authorization
  ) {
    return {
      isSuccessful: false,
      message: "Unauthorized",
    };
  }

  return details as ResponseType<"renderAgentDetails">;
};
