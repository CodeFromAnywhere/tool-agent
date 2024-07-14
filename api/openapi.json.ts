import { OpenapiDocument, pruneOpenapi } from "openapi-util";
import openapi from "../public/openapi.json";

const isDev = process.env.__VERCEL_DEV_RUNNING === "1";

export const GET = async (request: Request) => {
  const operationIds = new URL(request.url).searchParams
    .get("operationIds")
    ?.split(",")
    .map((x) => x.trim());
  const pruned = operationIds
    ? await pruneOpenapi(openapi as OpenapiDocument, operationIds)
    : openapi;

  const finalOpenapi = {
    ...pruned,
    servers: isDev ? [{ url: "http://localhost:3000" }] : openapi.servers,
  };
  return new Response(JSON.stringify(finalOpenapi, undefined, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
