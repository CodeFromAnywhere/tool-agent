import * as client from "@/sdk/client";

/** Finds the info from the user */
export const readAgentUser = async (request: Request) => {
  const Authorization = request.headers.get("Authorization");
  const userAuth = Authorization?.slice("Bearer ".length);
  if (!userAuth) {
    return new Response("No Authorization token provided", { status: 403 });
  }
  const item = (await client.migrateAgentUser("read", { rowIds: [userAuth] }))
    .items?.[userAuth];
  if (!item) {
    return new Response("User not found", { status: 403 });
  }

  return new Response(JSON.stringify(item, undefined, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
