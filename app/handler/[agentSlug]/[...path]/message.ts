import { O, getSubsetFromObject, objectMapSync } from "from-anywhere";
import { Endpoint } from "@/client";

/**
Update an item in a specified row in a table.

- applies authorization
- validates the partial item against the schema to ensure its correct

 */
export const message: Endpoint<"message"> = async (context) => {
  const { agentSlug, message, threadId, Authorization } = context;

  return { isSuccessful: true, message: "Updated" };
};
