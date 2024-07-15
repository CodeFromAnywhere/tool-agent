import * as client from "@/sdk/client";
import providers from "../../../../public/providers.json";

/**
 * The authorization server can call this with a code and state. With this we should call the Token URL and attach an accessToken to the right user.
 *
 * TO TRY: http://github.com/login/oauth/authorize?response_type=code&client_id=Ov23li2FVyYV9zqL6oJI&redirect_uri=https://deploy.actionschema.com/oauth/callback
 */
export const oauth2Callback = async (request: Request) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  // NB: not really needed. just here for coherence with other endpoint
  const service = url.pathname.split("/").slice(2, 3).join("/");

  if (!code || !state || !service) {
    return new Response(JSON.stringify({ error: "Invalid parameters" }), {
      status: 422,
    });
  }

  // 1) look up state --> get user auth token
  const stateItem = (
    await client.migrateOauthState("read", { rowIds: [state] })
  ).items?.[state];

  if (
    !stateItem ||
    !stateItem.userAuthToken ||
    !stateItem.service ||
    !stateItem.adminAuthToken
  ) {
    return new Response(JSON.stringify({ error: "State invalid" }), {
      status: 403,
    });
  }

  const admin = (
    await client.migrateOauthAdmin("read", {
      rowIds: [stateItem.adminAuthToken],
    })
  )?.items?.[stateItem.adminAuthToken];

  if (!admin) {
    return new Response(JSON.stringify({ error: "Could not find admin" }), {
      status: 403,
    });
  }

  const userResult = await client.migrateAgentUser("read", {
    rowIds: [stateItem.userAuthToken],
  });
  // NB: we don't make a user yet at login so it's not required
  const userAlready = userResult.items?.[stateItem.userAuthToken];

  // get adminstuff
  const oauthDetail = admin.oauthDetails?.find(
    (x) => x.service === stateItem.service,
  );
  if (!oauthDetail) {
    return new Response(
      JSON.stringify({ error: "Service details could not be found" }),
      { status: 400 },
    );
  }

  const provider = providers[service as keyof typeof providers];

  const tokenUrl = (provider as any).token_url as string | undefined;

  if (!tokenUrl) {
    return new Response(JSON.stringify({ error: "Invalid service" }), {
      status: 404,
    });
  }

  const fullUrl = `${tokenUrl}?client_id=${oauthDetail.appId}&client_secret=${oauthDetail.appSecret}&code=${code}`;

  type TokenResult = {
    access_token?: string;
    token_type?: string;
    scope?: string;
    expires_in?: number;
    refresh_token?: string;
    error?: string;
  };
  const tokenResult = await fetch(fullUrl, {
    method: "POST",
    headers: { Accept: "application/json" },
  })
    .then((res) => {
      if (res.ok) {
        return res.json() as Promise<TokenResult>;
      }
      console.log({ status: res.status, message: res.statusText });
      return { error: `${res.status}: ${res.statusText}` };
    })
    .catch((e) => {
      console.log("error fetching access token", e);
      return undefined;
    });

  if (!tokenResult || !tokenResult.access_token) {
    return new Response(
      JSON.stringify({
        error: `Error fetching access token: ${tokenResult?.error || ""}`,
      }),
      { status: 400 },
    );
  }

  const { access_token, expires_in, refresh_token, scope, token_type } =
    tokenResult;

  const newKeys = userAlready?.keys || [];

  newKeys.push({
    service,
    access_token,
    scope,
    token_type: token_type || "Bearer",
    expires_in: expires_in || 0,
    refresh_token,
    //todo: cleanup
    openapiUrl: (provider as any).openapiUrl,
  });

  // add the new key
  const addKeyResult = await client.migrateAgentUser("update", {
    id: stateItem.userAuthToken,
    partialItem: { keys: newKeys },
  });

  if (!addKeyResult.isSuccessful) {
    return new Response(
      JSON.stringify({
        error: `Error adding keys`,
      }),
      { status: 400 },
    );
  }

  // remove state item
  await client.migrateOauthState("remove", { rowIds: [state] });

  return new Response(JSON.stringify({ ok: true, message: "Redirecting" }), {
    status: 302,

    // TODO: Figure out how I can ensure that a new authToken gets attached to the browser localStorage or so. In both endpoints we are redirecting

    // A better way would be to create a state endpoint that I add a key to so I can call that on the frontend and get the userAuthToken (so i can set it to localstorage after redirect, without it ending up in browser history)
    headers: {
      Location:
        stateItem.redirectUrl ||
        `${url.origin}?authToken=${stateItem.userAuthToken}`,
    },
  });
};

// Lot of stuff I was doing just to get the tokenUrl. Also it's slow. Can we do something else?
// const dereferenced = agent?.openapiUrl
//   ? ((await resolveSchemaRecursive({
//       documentUri: agent.openapiUrl,
//       shouldDereference: true,
//     })) as OpenapiDocument | undefined)
//   : undefined;

// if (!dereferenced) {
//   return { error: "Couldn't find openapi" };
// }

// const securityKeys = dereferenced?.security
//   ?.map((item) => Object.keys(item))
//   .flat();
// const firstKey = securityKeys?.[0];
// const securitySchema = firstKey
//   ? (dereferenced?.components?.securitySchemes?.[firstKey] as
//       | SecuritySchemeObject
//       | undefined)
//   : undefined;

// if (securitySchema?.type !== "oauth2") {
//   return {
//     error:
//       "Only oauth2 supported for now for callback. Ensure your agent openapi uses oauth2",
//   };
// }

// if (!securitySchema.flows.authorizationCode) {
//   return {
//     error:
//       "Couldn't find authcode flow, which is the only one supported now.",
//   };
// }

// const { tokenUrl, authorizationUrl, scopes, refreshUrl } =
//   securitySchema.flows.authorizationCode;

// //NB: this should be present in the admin thing, and somehow we must be able to link it to this call.
// const clientId = undefined;
// const clientSecret = undefined;

// const fullUrl = `${tokenUrl}?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`;
