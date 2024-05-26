"use client";

import { OpenapiForm } from "react-openapi-form";
import openapi from "../public/openapi.json";
import { useStore } from "./store";
import { useRouter } from "next/navigation";
import { RefreshOpenaiResponse } from "./openapi-types";

export const Form = () => {
  const [databases, setDatabases] = useStore("agents");
  const router = useRouter();
  return (
    <div>
      <b>Authenticate</b>
      <p>Please provide an authorized OpenAI secret key to get started.</p>
      <div className="my-10">
        <OpenapiForm
          openapi={openapi}
          path="/refreshOpenai"
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
          }}
        />
      </div>
    </div>
  );
};
