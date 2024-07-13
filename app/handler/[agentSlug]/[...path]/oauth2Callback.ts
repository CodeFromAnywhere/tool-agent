/*
To get oauth2 working:

1. make an oauth app on the service, and manually fill get/fill in these details:

- Github App ID
- Authorizaton callback url
- Github client secret

2. Ensure the callback url is working. github directs the user to it with `?code={YOURCODE}`.
*/

import { Endpoint } from "@/client";
import * as client from "@/sdk/client";
import { SecuritySchemeObject } from "openapi-typescript";
import { OpenapiDocument } from "openapi-util";
import { resolveSchemaRecursive } from "openapi-util/build/resolveSchemaRecursive";

export const json = (data: any) => {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

/**
 * TO TRY: http://github.com/login/oauth/authorize?response_type=code&client_id=Ov23li2FVyYV9zqL6oJI&redirect_uri=https://deploy.actionschema.com/oauth/callback
 */
export const oauth2Callback: Endpoint<"oauth2Callback"> = async (context) => {
  const { code, agentSlug } = context;
  if (!code || !agentSlug) {
    return { error: "No code given" };
  }
  const agentResult = await client.migrateAgentOpenapi("read", {
    rowIds: [agentSlug],
  });
  const agent = agentResult.items?.[agentSlug];

  if (!agent || !agent.adminAuthToken) {
    return { error: "No agent" };
  }
  const adminResult = (
    await client.migrateAgentAdmin("read", { rowIds: [agent.adminAuthToken] })
  )?.items?.[agent.adminAuthToken];

  if (!adminResult) {
    return {
      error: "Unauthorized. Couldn't find admin.",
    };
  }

  const dereferenced = agent?.openapiUrl
    ? ((await resolveSchemaRecursive({
        documentUri: agent.openapiUrl,
        shouldDereference: true,
      })) as OpenapiDocument | undefined)
    : undefined;

  if (!dereferenced) {
    return { error: "Couldn't find openapi" };
  }

  const securityKeys = dereferenced?.security
    ?.map((item) => Object.keys(item))
    .flat();
  const firstKey = securityKeys?.[0];
  const securitySchema = firstKey
    ? (dereferenced?.components?.securitySchemes?.[firstKey] as
        | SecuritySchemeObject
        | undefined)
    : undefined;

  if (securitySchema?.type !== "oauth2") {
    return {
      error:
        "Only oauth2 supported for now for callback. Ensure your agent openapi uses oauth2",
    };
  }

  if (!securitySchema.flows.authorizationCode) {
    return {
      error:
        "Couldn't find authcode flow, which is the only one supported now.",
    };
  }

  const { tokenUrl, authorizationUrl, scopes } =
    securitySchema.flows.authorizationCode;

  //NB: this should be present in the admin thing, and somehow we must be able to link it to this call.
  const clientId = undefined;
  const clientSecret = undefined;

  const fullUrl = `${tokenUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;

  const tokenUrlResult: {
    access_token?: string;
    token_type?: "bearer";
    scope?: string;
    error?: string;
  } = await fetch(fullUrl, {
    method: "POST",
    headers: { Accept: "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      console.log({ status: res.status, message: res.statusText });
      return { error: `${res.status}: ${res.statusText}` };
    })
    .catch((e) => {
      console.log("error fetching access token", e);
      return { error: "error fetching access token" };
    });

  return tokenUrlResult;
};
