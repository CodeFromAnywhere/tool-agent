"use client";

import { OpenapiForm } from "react-openapi-form";
import openapi from "../public/openapi.json";
import { useStore } from "./store";
import { UpsertToolAgentResponse } from "./openapi-types";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export const Form = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentSlug = searchParams.get("agentSlug");

  const [agents, setAgents, { hydrated }] = useStore("agents");

  const agentAlready = agents?.find((x) => x.agentSlug === agentSlug);

  const [adminAuthToken, setAdminAuthToken] = useStore("adminAuthToken");
  return (
    <div>
      <b>Create an agent</b>
      <div className="my-10">
        {hydrated ? (
          <OpenapiForm
            openapi={openapi}
            path="/api/upsertToolAgent"
            method="post"
            initialData={agentAlready || { adminAuthToken }}
            uiSchema={{
              adminAuthToken: { "ui:widget": "password" },
              instructions: { "ui:widget": "textarea" },
            }}
            withResponse={(response) => {
              const {
                statusCode,
                statusText,
                body,
                headers,
                method,
                bodyData,
                url,
              } = response;
              const requestResponse = response.response as
                | UpsertToolAgentResponse
                | undefined;

              if (!requestResponse?.isSuccessful || !requestResponse.result) {
                alert(requestResponse?.message);
                return;
              }

              setAgents(
                agents
                  .filter(
                    (x) => x.agentSlug !== requestResponse.result?.agentSlug,
                  )
                  .concat(requestResponse.result),
              );

              if (bodyData?.adminAuthToken) {
                setAdminAuthToken(bodyData.adminAuthToken);
              }

              router.push(`/${requestResponse.result?.agentSlug}`);
            }}
          />
        ) : null}
      </div>
    </div>
  );
};
