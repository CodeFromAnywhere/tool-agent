import { Endpoint, ResponseType } from "@/client";
import { agentOpenapi } from "@/crud-client";

export const renderAgentDetails: Endpoint<"renderAgentDetails"> = async (
  context,
) => {
  const { agentSlug, Authorization } = context;

  // NB: no auth needed for this endpoint.

  if (!agentSlug) {
    return {
      isSuccessful: false,
      message: "No slug",
    };
  }

  const details = (
    await agentOpenapi("read", { rowIds: [agentSlug.toLowerCase()] })
  ).items?.[agentSlug];

  if (!details) {
    return {
      isSuccessful: false,
      message: "Couldn't find details for agent " + agentSlug,
    };
  }

  console.log({ details, Authorization });
  if (
    details.adminAuthToken &&
    details.adminAuthToken.length >= 32 &&
    `Bearer ${details.adminAuthToken}` !== Authorization
  ) {
    return {
      isSuccessful: false,
      message: "Unauthorized",
    };
  }

  return details as ResponseType<"renderAgentDetails">;
};
