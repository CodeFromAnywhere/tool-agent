import { Endpoint, ResponseType } from "@/client";
import { agentOpenapi } from "@/crud-client";

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

  const details = (await agentOpenapi("read", { rowIds: [agentSlug] })).items?.[
    agentSlug
  ]?.assistant;

  if (!details) {
    return {
      isSuccessful: false,
      message: "Couldn't find details for agent " + agentSlug,
    };
  }

  return details as ResponseType<"renderAgentDetails">;
};
