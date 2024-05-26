import { useEffect } from "react";
import { useStore } from "./store";

export const Overview = () => {
  const [agents] = useStore("agents");

  return (
    <div className="my-4">
      {agents && agents.length > 0 ? <b>My agents</b> : null}
      <ul>
        {agents
          ? agents.map((item) => {
              return (
                <li
                  className="ml-2 list-inside list-disc list-item"
                  key={item.id}
                >
                  <p>
                    <a href={`/${item.agentSlug}`}>{item.agentSlug}</a>
                  </p>
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
};
