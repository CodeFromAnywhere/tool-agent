import { OpenapiDocument } from "openapi-util";
import { resolveOpenapiAppRequest } from "openapi-util/build/node/resolveOpenapiAppRequest";
import openapi from "../../../../public/openapi.json";
import { message } from "./message";
import { renderAgentOpenapi } from "./renderAgentOpenapi";
import { refreshOpenai } from "./refreshOpenai";
import { renderAgentDetails } from "./renderAgentDetails";

/** function creator to DRY */
const getHandler = (method: string) => (request: Request) =>
  resolveOpenapiAppRequest(request, method, {
    openapi: openapi as OpenapiDocument,
    functions: {
      message,
      renderAgentDetails,
      renderAgentOpenapi,
      refreshOpenai,
    },
  });

export const GET = getHandler("get");
export const POST = getHandler("post");
export const PUT = getHandler("put");
export const PATCH = getHandler("patch");
export const DELETE = getHandler("delete");
export const HEAD = getHandler("head");
export const OPTIONS = getHandler("options");
