import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import { getConversation } from "@lib/model";
import { ConversationWithInfo, Model, Prompt } from "@lib/model.types";
import useSettings from "@store/settings";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const useChat = () => {
  // store and states
  const settingsStore = useSettings();
  const [messages, setMessages] = useState<string[]>([]);

  // database
  const activeModel: Model | undefined = useLiveQuery(
    async () =>
      settingsStore.activeModelId
        ? await db.model.get(settingsStore.activeModelId)
        : undefined,
    [settingsStore.activeModelId]
  );
  const activePrompt: Prompt | undefined = useLiveQuery(
    async () =>
      settingsStore.activePromptId
        ? await db.prompt.get(settingsStore.activePromptId)
        : undefined,
    [settingsStore.activePromptId]
  );
  const activeConversation: ConversationWithInfo | undefined = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId]
  );

  // form
  const {
    reset,
    register,
    handleSubmit,
    setFocus,
    formState: { isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(
      yup
        .object({ input: yup.string().required("Input is a required field.") })
        .required()
    ),
  });

  // always start new conversation on page first load
  useEffect(() => {
    settingsStore.setActiveConversation(undefined);
  }, []);

  // reset input and clear streamed text after complete
  useEffect(() => {
    reset();
    setMessages([]);
  }, [isSubmitSuccessful]);

  // autoscroll
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isSubmitting, messages]);

  // check if model is thinking
  const [isThinking, setIsThinking] = useState(false);
  useEffect(() => {
    if (messages[messages.length] === "</think>") {
      setMessages([]);
      setIsThinking(false);
      return;
    }
    setIsThinking(messages[0] === "<think>" && !messages.includes("</think>"));
  }, [messages]);

  return {
    form: {
      register,
      handleSubmit,
      isLoading,
      isSubmitting,
      setFocus,
    },
    scrollRef,
    activeModel,
    activePrompt,
    activeConversation,
    isThinking,
    messages,
    setMessages,
  };
};

export default useChat;
