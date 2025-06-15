import { invoke } from "@tauri-apps/api/core";
import { Chat } from "../database/chat";

export const TIME_FORMAT = "DD MMM YYYY, hh:mm:ss a";

export type ChatCompletionMessageParam = {
  role: "developer" | "user" | "assistant" | "tool" | "function";
  content: string;
};

export const removeThoughtFromReply = (message: string): string => {
  const regex = /^<think>(.*?)<\/think>(.*)/s;
  const match = regex.exec(message);
  return match ? match[2].trim() : message;
};

export const fetchModelList = async (
  baseURL?: string,
  apiKey?: string,
): Promise<string[]> => {
  return await invoke("get_model_list", {
    base_url: baseURL,
    api_key: apiKey,
  });
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
