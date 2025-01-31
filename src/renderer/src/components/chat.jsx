import { yupResolver } from '@hookform/resolvers/yup';
import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';
import OpenAI from 'openai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { db } from '../lib/database';
import useSettings from '../store/settings';

const INPUT_REFOCUS_DELAY_MS = 1000;

const getCurrentConversation = async (conversationId) => {
  const conversation = await db.conversation.get(conversationId);
  if (conversation) {
    [conversation.assistant, conversation.chats] = await Promise.all([
      db.assistant.get(conversation.assistantId),
      db.chat.where({ conversationId: conversation.id }).toArray()
    ]);
    conversation.assistant.model = await db.model.get(conversation.assistant.modelId);
  }
  return conversation;
};

const getActiveAssistant = async (assistantId) => {
  const assistant = await db.assistant.get(assistantId);
  assistant.model = await db.model.get(assistant.modelId);
  return assistant;
};

export default function Chat() {
  const settingsStore = useSettings();
  const activeAssistant = useLiveQuery(
    async () =>
      settingsStore.activeAssistantId
        ? await getActiveAssistant(settingsStore.activeAssistantId)
        : undefined,
    [settingsStore.activeAssistantId]
  );
  let activeConversation = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getCurrentConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId]
  );

  const schema = yup
    .object({ input: yup.string().required('Input is a required field.') })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    setFocus,
    formState: { isLoading, isSubmitting, isSubmitSuccessful }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const inputRef = useRef(null);
  const [message, setMessage] = useState([]);
  const onSubmit = useCallback(
    async (data) => {
      if (!activeAssistant) return;

      const client = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: activeAssistant.model.baseUrl,
        apiKey: window.api.decrypt(settingsStore.openAiApiKey)
      });
      const messages = [
        { role: 'system', content: activeAssistant.prompt },
        ...(activeConversation?.chats
          ? activeConversation.chats.flatMap((c) => [
              { role: 'user', content: c.user },
              { role: 'assistant', content: c.assistant }
            ])
          : []),
        { role: 'user', content: data.input }
      ];
      const stream = await client.chat.completions.create({
        messages,
        stream: true,
        model: activeAssistant.modelId
      });

      const currentConversationId = !activeConversation
        ? await db.conversation.add({ assistantId: activeAssistant.id })
        : activeConversation.id;
      const currentChatId = await db.chat.add({
        conversationId: currentConversationId,
        user: data.input,
        sentAt: Date.now()
      });
      settingsStore.setActiveConversation(currentConversationId);

      let fullText = '';
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        fullText += text;
        setMessage((state) => [...state, text]);
      }

      await db.chat.update(currentChatId, {
        assistant: fullText,
        receivedAt: Date.now()
      });
      activeConversation = await getCurrentConversation(currentConversationId);

      // reset and refocus
      setTimeout(() => {
        setFocus('input');
      }, INPUT_REFOCUS_DELAY_MS);
    },
    [activeAssistant, activeConversation]
  );

  useEffect(() => {
    reset();
    setMessage('');
  }, [isSubmitSuccessful]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === 'Enter') {
        handleSubmit(onSubmit)();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit, onSubmit]);

  return (
    <>
      <div className="mx-6 my-2 flex-grow overflow-auto">
        {activeConversation ? (
          <>
            <Conversation chats={activeConversation.chats} />
            {message.length > 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble">{message.join('')}</div>
              </div>
            )}
          </>
        ) : (
          'undefined'
        )}
      </div>
      <form
        className="m-6 mt-0 flex-none"
        onSubmit={activeAssistant ? handleSubmit(onSubmit) : undefined}
      >
        <fieldset className="fieldset ">
          <legend className="fieldset-legend">Your message</legend>
          <textarea
            ref={inputRef}
            autoFocus
            disabled={isSubmitting || isLoading}
            className="textarea w-full"
            {...register('input')}
          />
          <div className="fieldset-label">Shift+Enter to send.</div>
        </fieldset>
      </form>
    </>
  );
}

function Conversation({ chats }) {
  const FORMAT = 'HH:mm:ss, DD/MM/YYYY';
  return chats.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-start space-y-1">
        <div className="chat-bubble chat-bubble-primary">{chat.user}</div>
        <div className="chat-footer opacity-50">{dayjs(chat.sentAt).format(FORMAT)}</div>
      </div>
      {chat.assistant && (
        <div className="chat chat-end space-y-1">
          <div className="chat-bubble">{chat.assistant}</div>
          <div className="chat-footer opacity-50">{dayjs(chat.receivedAt).format(FORMAT)}</div>
        </div>
      )}
    </div>
  ));
}
