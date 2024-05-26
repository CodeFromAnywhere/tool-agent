import { Endpoint } from "@/client";

export const refreshOpenai: Endpoint<"refreshOpenai"> = async (context) => {
  const { openaiSecretKey } = context;

  return { isSuccessful: true, message: "Updated" };
};
