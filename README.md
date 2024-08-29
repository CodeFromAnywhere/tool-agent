⚠️⚠️⚠️ WIP - Don't Use This. Check back in 2025! ⚠️⚠️⚠️

~ I am first working on more foundational work for high quality agents using tools.

# Purpose

- Registry for searchable, evaluated agents, accessible through openapi.
- Easy access at website https://agent.actionschema.com/{slug} and it's also a basePath for chat completion API now.
- Create a fully private agent-setup. User only sees https://boardapp.nl/chat/{agent-name} to chat with the agent for that particular company.
- Hides implementation for foundation model creation while having the ability to make this open source.
- Allows to serve your settings (system prompt + secrets) as freemium API to users.

Configurable per slug:

- It should add the IP/user-level paywall ratelimit
- It should add LLM key, OpenAPI secret (if not oauth) and OpenAPI url
- System prompt, model choice, basePath, etc

<!-- On `openapi-chat-completion` OpenAPIs are now open and exposed to the user. This is extremely powerful, but it's possible to hide and create a basemodel too. All we need to do is create a kv store that maps a slug to the openapi (and partial profile), and then it's a matter of using https://chat.actionschema.com/{slug} as a basepath. From here you can chat with it, and https://chat.actionschema.com/{slug}/chat/completions and https://chat.actionschema.com/{slug}/openapi.json would be available too.

This adds complexity, but also cleans up the interface a lot, and creates a lot of IP for the creator of the agent. Maybe even including the API key! Nevertheless we can still link to the openapi for the free version.

🤔🔥 `openapi-chat-completion` is an internal tool behind login without state. `openapi-agent` can become a profile registry on top of it, adding state, exposed at https://agent.actionschema.com/{slug} baseUrl.

TODO:

- Not sure if this is the right moment. Maybe finish chat first, making it super stable and focussing on api tool use stability.
 -->
