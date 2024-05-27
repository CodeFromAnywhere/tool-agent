"use client";

import { OpenapiForm } from "react-openapi-form";
import { useStore } from "../../store";

export default function AgentPage(props: { params: { agentSlug: string } }) {
  const [agents, setDatabases] = useStore("agents");
  const agent = agents?.find((x) => x.agentSlug === props.params.agentSlug);

  /*This is not possible: process.env.NODE_ENV === "development"
      ? `http://localhost:3000`
      : `https://data.actionschema.com` 
      
      that will provide mixed-content problems:Possible mixed-content issue? The page was loaded over https:// but a http:// URL was specified. Check that you are not attempting to load mixed content.
*/
  const origin = `https://agent.actionschema.com`;
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
      <div></div>
    </div>
  );
}
