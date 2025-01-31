import { yupResolver } from '@hookform/resolvers/yup';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { getActiveAssistant, getActiveConversation } from '../lib/database';
import useSettings from '../store/settings';

const useChat = () => {
  // store and states
  const settingsStore = useSettings();
  const [messages, setMessages] = useState([]);

  // database
  const activeAssistant = useLiveQuery(
    async () =>
      settingsStore.activeAssistantId
        ? await getActiveAssistant(settingsStore.activeAssistantId)
        : undefined,
    [settingsStore.activeAssistantId]
  );
  const activeConversation = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getActiveConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId]
  );

  // form
  const {
    reset,
    register,
    handleSubmit,
    setFocus,
    formState: { isLoading, isSubmitting, isSubmitSuccessful }
  } = useForm({
    resolver: yupResolver(
      yup.object({ input: yup.string().required('Input is a required field.') }).required()
    )
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
  const scrollRef = useRef(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  return {
    form: {
      register,
      handleSubmit,
      isLoading,
      isSubmitting,
      setFocus
    },
    scrollRef,
    activeAssistant,
    activeConversation,
    messages,
    setMessages
  };
};

export default useChat;
