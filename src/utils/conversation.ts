import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources.mjs";
import { Chat } from "../database/chat";

export const TIME_FORMAT = "DD MMM YYYY, hh:mm:ss a";

export const parseThinkingReply = (message: string): string => {
  const regex = /^<think>(.*?)<\/think>(.*)/s;
  const match = regex.exec(message);
  return match ? match[2].trim() : message;
};

export const fetchModelList = async (baseURL?: string, apiKey?: string) => {
  const client = new OpenAI({ baseURL, apiKey, dangerouslyAllowBrowser: true });
  const models = await client.models.list();
  return models.data.map((m) => m.id);
};

export const prepareMessages = ({
  chats,
  system,
  input,
}: {
  chats: Chat[];
  system: string;
  input: string;
}): ChatCompletionMessageParam[] => {
  const messages: ChatCompletionMessageParam[] = [];
  if (system) {
    messages.push({ role: "developer", content: system });
  }
  (chats || []).forEach((chat) => {
    messages.push({ role: "user", content: chat.user });
    if (chat.assistant) {
      messages.push({ role: "assistant", content: chat.assistant });
    }
  });
  messages.push({ role: "user", content: input });
  return messages;
};
