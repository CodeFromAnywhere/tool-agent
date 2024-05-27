"use client";

import { OpenapiForm } from "react-openapi-form";
import openapi from "../public/openapi.json";
import { useStore } from "./store";
import { useRouter } from "next/navigation";
import { RefreshOpenaiResponse } from "./openapi-types";
import { fileSlugify, kebabCase } from "from-anywhere";

export const Form = () => {
  const [agents, setAgents] = useStore("agents");
  const router = useRouter();
  return (
    <div>
      <b>Authenticate</b>
      <p>Please provide an authorized OpenAI secret key to get started.</p>
      <div className="my-10">
        <OpenapiForm
          openapi={openapi}
          path="/api/refreshOpenai"
          method="post"
          uiSchema={{}}
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
              | RefreshOpenaiResponse
              | undefined;

            if (!requestResponse?.isSuccessful || !requestResponse.result) {
              alert(requestResponse?.message);
              return;
            }

            const agents = requestResponse.result.map((item) => ({
              id: item.id,
              agentSlug: fileSlugify(item.name || item.id).toLowerCase(),
              assistant: item,
            }));

            console.log({ agents });
            setAgents(agents);
          }}
        />
      </div>
    </div>
  );
};
