import * as client from "@/sdk/client";
import { generateRandomString } from "from-anywhere";
import { SecuritySchemeObject } from "openapi-typescript";
import { OpenapiDocument, resolveSchemaRecursive } from "openapi-util";

import providers from "../../../../public/providers.json";
/**
 * Login by authorized user or unauthorized anyone
 *
 * - into a given service oauth app
 * - oauth app ID+Secret from the main admin
 *
 * This endpoint redirects the user to the login service provider and ties the state to the user.
 */
export const oauth2Login = async (request: Request) => {
  const url = new URL(request.url);
  const service = url.pathname.split("/").slice(2, 3).join("/");
  const Authorization = request.headers.get("Authorization");
  let bearerAuthToken = Authorization?.slice("Bearer ".length);

  const adminToken = process.env.CRUD_ADMIN_TOKEN;
  if (!adminToken) {
    return new Response("Unauthorized", { status: 403 });
  }

  if (!service || service === "") {
    return new Response("Please provide a service", { status: 422 });
  }

  if (bearerAuthToken) {
    // NB: if you give a bearer token, it must be a valid one, connected to an existing user
    const user = (
      await client.migrateAgentUser("read", { rowIds: [bearerAuthToken] })
    )?.items?.[bearerAuthToken];
    if (!user) {
      return new Response("Authorization invalid", { status: 403 });
    }
  }

  //For now, only my own admin
  const adminResult = (
    await client.migrateOauthAdmin("read", {
      rowIds: [adminToken],
    })
  )?.items?.[adminToken];

  console.log({ adminResult });

  const oauthDetail = adminResult?.oauthDetails?.find(
    (item) => item.service === service,
  );

  const provider = providers[service as keyof typeof providers];

  const authorizationUrl = (provider as any).authorization_url as
    | string
    | undefined;
  if (
    !provider ||
    !authorizationUrl ||
    !oauthDetail ||
    !oauthDetail.appId ||
    !oauthDetail.appSecret ||
    !oauthDetail.securitySchemeKey ||
    !oauthDetail.service
  ) {
    console.log({ authorizationUrl, oauthDetail });
    return new Response("Service not found", { status: 404 });
  }

  //   const dereferenced = serviceOpenapiUrl
  //     ? ((await resolveSchemaRecursive({
  //         documentUri: serviceOpenapiUrl,
  //         shouldDereference: true,
  //       })) as OpenapiDocument | undefined)
  //     : undefined;

  //   if (!dereferenced) {
  //     return new Response("OpenAPI not found", { status: 404 });
  //   }

  //   const securitySchema = dereferenced?.components?.securitySchemes?.[
  //     oauthDetail.securitySchemeKey
  //   ] as SecuritySchemeObject | undefined;

  //   if (securitySchema?.type !== "oauth2") {
  //     return new Response(
  //       "Only oauth2 supported for now for callback. Ensure your agent openapi uses oauth2",
  //       { status: 404 },
  //     );
  //   }

  // const scopes = securitySchema.flows.authorizationCode?.scopes

  // todo:
  const scopes: string[] = [];
  const scope = Object.keys(scopes).join(
    //@ts-ignore
    provider.scope_separator || "",
  );
  const oauthState = generateRandomString(64);

  const newAuthToken = generateRandomString(64);
  if (!bearerAuthToken) {
    //sign up
    bearerAuthToken = newAuthToken;
  }

  // set state item
  const setOauthStateResult = await client.migrateOauthState("update", {
    id: oauthState,
    partialItem: {
      adminAuthToken: adminToken,
      service,
      userAuthToken: bearerAuthToken,
    },
  });

  if (!setOauthStateResult.isSuccessful) {
    return new Response("Setting state went wrong", { status: 500 });
  }

  const fullAuthorizationUrl = `${authorizationUrl}?response_type=code&client_id=${oauthDetail.appId}&state=${oauthState}&scope=${scope}`; //&redirect_uri=${redirectUri}

  return new Response("Redirecting...", {
    status: 302,
    headers: { Location: fullAuthorizationUrl },
  });
};
