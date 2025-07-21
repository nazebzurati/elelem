import { getChatListByRefId } from "@database/chat";
import { getConversation } from "@database/conversation";
import { ModelWithDetails } from "@database/model";
import { Prompt } from "@database/prompt";
import { yupResolver } from "@hookform/resolvers/yup";
import useChatStore from "@stores/chat";
import useSettingsStore from "@stores/settings";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const useChat = ({
  modelList,
  promptList,
}: {
  modelList: ModelWithDetails[];
  promptList: Prompt[];
}) => {
  // form
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    formState: { isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(
      yup
        .object({
          input: yup.string().label("Input").required(),
        })
        .required(),
    ),
  });

  const chatStore = useChatStore();
  const settingsStore = useSettingsStore();
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState<string[]>([]);

  // reset input and clear text stream after complete
  useEffect(() => {
    reset();
    setMessages([]);
    setThoughts([]);
  }, [isSubmitSuccessful]);

  // always reset selected chat to edit
  useEffect(() => {
    chatStore.setSelectedChat();
    chatStore.setSelectedChatRefId();
  }, []);

  // check if model is thinking
  useEffect(() => {
    if (messages[messages.length] === "</think>") {
      setMessages([]);
      setIsThinking(false);
      return;
    }

    // set isThinking
    const isThinking =
      messages[0] === "<think>" && !messages.includes("</think>");
    setIsThinking(isThinking);

    // set thought
    if (isThinking) {
      const endIndex = messages.indexOf("</think>");
      setThoughts(messages.slice(1, endIndex));
    }
  }, [messages]);

  // get active model
  const activeModel: ModelWithDetails | undefined = useMemo(() => {
    return !modelList || !settingsStore.activeModelId
      ? undefined
      : modelList.find((p) => p.id === settingsStore.activeModelId);
  }, [modelList, settingsStore.activeModelId]);

  // get active prompt
  const activePrompt: Prompt | undefined = useMemo(() => {
    return !promptList || !settingsStore.activePromptId
      ? undefined
      : promptList.find((p) => p.id === settingsStore.activePromptId);
  }, [promptList, settingsStore.activePromptId]);

  // get active conversation
  const activeConversation = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId],
  );

  // get active chat (last chat with ref)
  const activeChat = useLiveQuery(async () => {
    return activeConversation?.chats
      ? getChatListByRefId(activeConversation.chats, chatStore.chatRefId).at(-1)
      : undefined;
  }, [chatStore.chatRefId, activeConversation]);

  return {
    form: {
      reset,
      register,
      handleSubmit,
      isLoading,
      isSubmitting,
      setValue,
    },
    chat: {
      activeModel,
      activePrompt,
      activeConversation,
      activeChat,
    },
    isThinking,
    thoughts,
    messages,
    setMessages,
  };
};

export default useChat;
