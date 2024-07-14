import * as client from "@/sdk/client";

/** Finds the info from the thread */
export const readAgentUserThread = async (request: Request) => {
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

  const threadId = new URL(request.url).searchParams.get("threadId");
  if (!threadId) {
    return new Response("No thread given", { status: 422 });
  }

  const thread = (
    await client.migrateAgentUserThread("read", { rowIds: [threadId] })
  ).items?.[threadId];

  if (!thread) {
    return new Response("Thread not found", { status: 404 });
  }

  return new Response(JSON.stringify(thread, undefined, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
