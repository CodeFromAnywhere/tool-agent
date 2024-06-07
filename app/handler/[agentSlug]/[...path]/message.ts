import { Endpoint } from "@/client";
import { agentOpenapi } from "@/crud-client";
import OpenAI from "openai";
import { TextContentBlock } from "openai/resources/beta/threads/messages.mjs";

export const message: Endpoint<"message"> = async (context) => {
  const { agentSlug, message, Authorization } = context;

  const result = await agentOpenapi("read", { rowIds: [agentSlug] });
  const first = result.items?.[agentSlug];

  if (!first || !Authorization || Authorization !== first.authToken) {
    return { isSuccessful: false, message: "Unauthorized" };
  }

  const openaiSecretKey = first.openaiSecretKey;

  const openai = new OpenAI({
    apiKey: openaiSecretKey,
  });

  const assistant = await openai.beta.assistants.retrieve(agentSlug);

  if (!assistant) {
    return { isSuccessful: false, message: "Assistant invalid" };
  }

  const thread = await openai.beta.threads.create({
    //  messages:[{content:message,role:"user"}]
  });

  const openaiMessage = await openai.beta.threads.messages.create(thread.id, {
    content: message,
    role: "user",
  });

  const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
    assistant_id: assistant.id,
    //  tools,
  });

  const messages = await openai.beta.threads.messages.list(thread.id);

  console.log({ messages: messages.data.map((x) => x.content) });
  const responseMessageItem = messages.data.shift();

  const responseMessage = (
    responseMessageItem?.content?.find((x) => x.type === "text") as
      | TextContentBlock
      | undefined
  )?.text?.value;

  if (!responseMessage) {
    return { isSuccessful: false, message: "Couldn't get message back" };
  }

  return { isSuccessful: true, message: responseMessage };
};
