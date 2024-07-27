# Auth App Management

Create a new admin services manager for myself, in which I can also see the user authorizations.

For things like CRUDs and Agents I made, I want them to be accessible by me personally, but it shouldn't be indexed by others. Figure out how to do this the right way.

# Refactor (less important)

- Move requestHandler to `vercel-template` and back to `openapi-util`.
- Refactor to be bare `vercel.json`
- Refactor to have a simpler API without too many parameters
- Change `runMigration` so it can also create agents based on the `agentConfig`

# Different LLMs

Research this:

https://sdk.vercel.ai/docs/foundations/providers-and-models#model-capabilities

https://sdk.vercel.ai/providers/ai-sdk-providers#provider-support

https://x.com/transitive_bs && https://github.com/transitive-bullshit/agentic

Can I use agentic or vercel AI to allow a user to select any provider+model and key? Try this... We'll have two parameters: `llm` and `llmSecret`.

Read here. These providers should all have an OpenAPI. I should be able to merge them into a single endpoint with some AI that maps it, given very specific instructions. I should be able to have a single gateway in which the openapi url, action, and parameters are provided, in which the map is cached. This would be super epic, as it allows people to provide their own openapi URL without changing the script.

# Threads

✅ Create CRUD for messages

Use the client for that to store messages for the thread. Ensure we use something like `X-USER-AUTH` or so for determining the user.

- For whatsapp, load in the thread of the phone number
- For phonecall, load in the thread for the phone number
- For email, load in the thread for the email

# Files

Now we are relying on gpt4 to process just the images which is useful as it is much more integrated and will be in the future, but what about processing of all kinds of stuff? An AI can do this in many ways and that is why we need cool tools.

Let's do it like this:

- provide `attachmentUrls` as text in an additional message, but provide some additional context for each file
- tools provided can use these URLs & context as parameters.

This way we can make our own multimodal LLM with extra functionalities that depend on the usecase. This keeps the model super general purpose.

A good start would be to create an agent that allows for image generation, speech generation, and speech analsysis. Perfect for whatsapp!

# OAuth2 Tool Use

1. Put types into `getOperationAvailable` and get either a loginUrl or userSecret back with it

2. ensure `parseTool` works as desired

3. ensure `message` works and respond with a login URL

4. The user logging-in will trigger a callback which should be able to add the authorization to the user under the proper `securitySchemeKey`

5. Make it provide the user-creds into the db. maybe need some metadata forwarding.

6. If we get unauthorized 403 while doing a toolcall, ensure the user-secret or app-secret gets flagged accordingly.

🎉 Now let's get something concrete. Add ±10 popular integrations that I actually use: slack, discord, github, etc... Add the clientId and clientSecret of the oAuth2 apps to my admin.

❗️ Before continuing, I want it to be easy to manage my admin oauth2 app list and also for a user to get their secrets as well in a single overview. Besides, let's see if it can be integrated into the openapi explorer so admins/users can create and manage their lists from there, and the auth gets correctly provided to the forms.

🟢 Green light for testing openapi tool use and ensure to support the top 3 auth methods.

## Dynamic tool use

- `dynamicToolMessage({adminAuthToken,message,attachmentUrls,instructions,openapiUrl})` should be possible, providing it instant instructions+tools where it can be assumed we have access to the clientKeys/secrets from ActionSchema or custom ones from the user.
- Work on improving the prompting to avoid common mistakes.
- The agent-user now has a list of openapis. Use that as a base for toolsearch.

# Infra

- User authwall
- Rate limits for free user
- Shoot in a meeting after hitting the ratelimit
- one-line middleware to serve HTML for every api

## AI Coding (3)

- Also create a prompt that uses this to directly create code
- Also create a prompt that allows an agent to turn its entire thread into code based on learnings.
- This, hosted, and added to the toolbelt, is (3)

# Agent redirect

Agent redirect in general is superb. The idea of an agent having the ability to call an endpoint that changes its own tools, would be very nice. If we combine this with context pruning, it could be revolutionary.

## Other high priority functionality

- Deepgram calls: Play with deepgram again, now make it really work with function calling and make apis for the webhooks
- Create a function `pastebin(string,path)` that puts a string at a URL so you can easily reduce context. Host it at https://io.actionschema.com (later also add other io functionality like uploading files/blobs easily to a good openapi, and e.g. file conversion)

<!--
Below here is more brainstorm than actual todo... we want to get something to market!

What can I demo to developers in a way that they're excited about? Think 30s video, super clear message.
-->

## POC: CodeFromAnywhere

A simple website with one textarea input in which you can put your specification or prompt. It will launch an agent that tries to fulfil that by finding the right services + endpoints, then allowing you to login there, making it easy to provide oauth2 or private key. After you did that, it will test out the endpoints and get the job done in a thread.

- There can be multiple examples of use-cases to be clickable
- Good results can become cached indexable pages like v0
- We want to show code as part of the result too
- Free use, Ratelimit per IPp to 10 requests per hour, fill in form for early access afterwards.

## MVP: CodeFromAnywhere

- A linter that tells whether or not a repo fulfils a certain coding standard. A badge that can be put in your readme for it:
  - Should be small enough in code-size to fit prompt window (for now)
  - Should define everything in a discoverable OpenAPI
  - Forks and branches should be autohosted on a testing environment so they can be tested.
- An agent that can work with small codebases - public and private - that fulfil that standard
- You should be able to interact with this agent by connecting it to a repo. It will then watch all issues and create PRs when it knows what to do, testing its own PRs immediately.
- If this agent can already fork public repos and get to work by solving issues, this will be huge for marketing. If it can also open a PR on a repo that's not it's own, based on a fork, that'd be perfect. If that's not possible with the API, we can put a human in the loop and still get it done.
- The auto-generated frontend is not tested, but there's no need if we have an openapi agent network. There can be separate modules for improving frontend, this product should do a small frontend module but not loose focus. Focus on backend.

# Later:

- add ability for a callback message so we can send something after retreiving back the callback. this goes hand in hand with human-openapi.

MVP: Agent creator

APIs:

- From prompt to list of SaaS: `findOpenapis`
- From list of SaaS openapi summaries to list of operations needed `getRelevantOperations`
- From list of operations to openapi: `pruneOpenapis`
- ❗️ ❗️ ❗️ From openapi to sending a message to an insta-agent: adapt `message`, finish `oauth2` tool use
- See agent response stream back to the user.
- Keep chatting, but every chat, have a guardrail to repeat the above.
- The agent keeps user auth and takes actions without question
- After a conversation, have the ability to turn (a subset of) it into a piece of hosted code with specified abstraction.
