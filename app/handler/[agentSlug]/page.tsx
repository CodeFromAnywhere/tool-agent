"use client";

import { OpenapiForms } from "openapi-for-humans-react";
import { useStore } from "../../store";
import openapi from "../../../public/openapi.json";
import { useRouter } from "next/navigation";
export default function AgentPage(props: { params: { agentSlug: string } }) {
  const [agents, setDatabases] = useStore("agents");
  const agent = agents?.find((x) => x.agentSlug === props.params.agentSlug);
  const router = useRouter();
  /*This is not possible: that will provide mixed-content problems:Possible mixed-content issue? The page was loaded over https:// but a http:// URL was specified. Check that you are not attempting to load mixed content.
   */
  const origin =
    process.env.NODE_ENV === "development"
      ? `http://localhost:3000`
      : `https://agent.actionschema.com`;
  const openapiUrl = `${origin}/${props.params.agentSlug}/openapi.json`;

  const links = [
    {
      title: "Swagger",
      url: `https://petstore.swagger.io/?url=${openapiUrl}`,
    },
    {
      title: "Swagger Editor",
      url: `https://editor.swagger.io/?url=${openapiUrl}`,
    },
    {
      title: "OpenAPI GUI",
      url: `https://mermade.github.io/openapi-gui/?url=${openapiUrl}`,
    },
    {
      title: "Stoplight",
      url: `https://elements-demo.stoplight.io/?spec=${openapiUrl}`,
    },

    {
      title: "ActionSchema Combination Proxy",
      url: `https://proxy.actionschema.com/?url=${openapiUrl}`,
    },

    {
      title: "Source",
      url: openapiUrl,
    },
  ];

  return (
    <div className="p-10">
      <div className="flex flex-wrap flex-row gap-4 py-10 items-center">
        <a href="/"> ← </a>
        <h1 className="text-3xl">{props.params.agentSlug}</h1>
      </div>
      <div className="flex flex-row flex-wrap">
        {links.map((link) => {
          return (
            <a
              className="pr-6 text-blue-500 hover:text-blue-600"
              href={link.url}
              key={link.url}
            >
              {link.title}
            </a>
          );
        })}
      </div>

      <div className="">
        <div className="flex flex-row gap-2">
          <div
            className="border border-black rounded-md p-2 cursor-pointer"
            onClick={async () => {
              let deepgramToken = prompt("Please provide your deepgram token");

              const link = `https://agent-relay.actionschema.workers.dev/sts/${agent?.adminAuthToken}/${deepgramToken}/agent.actionschema.com/${agent?.agentSlug}/details`;
              await navigator.clipboard.writeText(link);
              alert("Copied to clipboard");
            }}
          >
            Get Twilio Call Webhook
          </div>

          <div
            className="border border-black rounded-md p-2 cursor-pointer"
            onClick={async () => {
              let twilioAccountSid = prompt(
                "Please provide your twilio account sid",
              );
              let twilioAuthToken = prompt(
                "Please provide your twilio authtoken",
              );
              const link = `https://agent-relay.actionschema.workers.dev/twilio?agentSlug=${agent?.agentSlug}&authToken=${agent?.authToken}&twilioAccountSid=${twilioAccountSid}&twilioAuthToken=${twilioAuthToken}`;
              await navigator.clipboard.writeText(link);
              alert(
                "Copied to clipboard. Can be used for Whatsapp, SMS, Messenger",
              );
            }}
          >
            Get Twilio Message Webhook
          </div>

          <div
            className="border border-black rounded-md p-2 cursor-pointer"
            onClick={async () => {
              let sendgridAuthToken = prompt(
                "Please provide your sendgrid authtoken",
              );
              const link = `https://agent-relay.actionschema.workers.dev/sendgrid?adminAuthToken=${agent?.adminAuthToken}&agentUrl=agent.actionschema.com/${agent?.agentSlug}/details&sendgridAuthToken=${sendgridAuthToken}`;
              await navigator.clipboard.writeText(link);
              alert("Copied to clipboard");
            }}
          >
            Get Sendgrid Email Webhook
          </div>

          <div
            className="border border-black rounded-md p-2 cursor-pointer"
            onClick={async () => {
              let deepgramToken = prompt("Please provide your deepgram token");
              const link = `https://agent-relay.actionschema.workers.dev/?agentUrl=agent.actionschema.com/${agent?.agentSlug}/details&adminAuthToken=${agent?.adminAuthToken}&deepgramToken=${deepgramToken}`;

              window.open(link, "_blank");
            }}
          >
            Start voicecall in-browser
          </div>

          <div
            className="border border-black rounded-md p-2 cursor-pointer"
            onClick={async () => {
              router.push(`/?agentSlug=${agent?.agentSlug}`);
            }}
          >
            Update
          </div>
        </div>

        <OpenapiForms
          key={openapiUrl}
          url={openapiUrl}
          initialData={{ httpBearerToken: agent?.authToken }}
          uiSchema={{ message: { "ui:widget": "textarea" } }}
        />
        {/* <OpenapiForm
          openapi={openapi}
          path="/{agentSlug}/message"
          method="post"
          initialData={{
            agentSlug: props.params.agentSlug,
            Authorization: agent?.authToken,
          }}
          // uiSchema={{ message: { "ui:widget": "textarea" } }}
          withResponse={(response) => {
            console.log({ response });
          }}
        /> */}
      </div>
    </div>
  );
}
