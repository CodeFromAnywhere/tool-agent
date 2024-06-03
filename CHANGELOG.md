# May 2024

- ✅ Setup boilerplate
- ✅ Fix routing issues
- ✅ Implement refresh propagation to localStorage
- ✅ change pattern data.actionschema to allow for `-_~.AZ`
- ✅ make AgentOpenapi item and create crud-openapi at https://data.actionschema.com/agent-openapi/openapi.json
- ✅ create npm script that turns openapi into an SDK client
- ✅ ensure `databaseId` goes lowercase upon creation
- ✅ Fix bug so the script `npm run crud` actually works
- ✅ Implement refresh storage
- ✅ Implement OpenAPI

# June 2024

- ✅ Implement simple `agent.actionschema.com/asst_xxxx/message` with `openai` SDK
- ✅ Expose `agent.actionschema.com/asst_xxxx/agent.json` with instructions & tools taken from openai's API.
- 🤔 Revelation: `Asssistant` doesn't contain any information about the API URL, paths, or Authentication. This makes this whole idea problematic as tools cannot be accessed without external implementation. Therefore, instead, we could build `agent.actionschema.com/[agentSlug]/message` and `agent.json` and `openapi.json` but not with login to openai.

## Refactor Agents

Instead, store this for OpenAIAgent: `{ agentSlug, openaiSecretKey, openapiAuth, deepgramToken, authToken, name, instructions, model, top_p, temperature, openapiUrl, functionsCalculated }`

Instead of `refreshOpenai`, let's create agents via a form in which you provide an `openapiUrl`+`instructions` and then you can manage further configuration.

Rename `details.json` to `GET details` and ensure it provides all details including `openapiAuth` only if `Authorization` header is set to match authToken.

Refactor `/message`. To support functions, it needs to call the OpenAPI based on something returned as step.

Confirm an agent with people-openapi tool works.
