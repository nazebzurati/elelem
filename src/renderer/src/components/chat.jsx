import 'katex/dist/katex.min.css';

import dayjs from 'dayjs';
import OpenAI from 'openai';
import { useCallback, useEffect } from 'react';
import Markdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import useChat from '../hooks/use-chat';
import { db } from '../lib/database';
import { prepareMessages } from '../lib/model';
import useSettings from '../store/settings';

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chat() {
  const settingsStore = useSettings();
  const {
    form: { register, handleSubmit, isLoading, isSubmitting, setFocus },
    scrollRef,
    activeAssistant,
    activeConversation,
    messages,
    setMessages
  } = useChat();

  const onSubmit = useCallback(
    async (data) => {
      if (!activeAssistant) return;

      // create chat
      const conversationId = activeConversation
        ? activeConversation.id
        : await db.conversation.add({ assistantId: activeAssistant.id, title: data.input });
      const chatId = await db.chat.add({ conversationId, user: data.input, sentAt: Date.now() });
      settingsStore.setActiveConversation(conversationId);

      // send chat request
      const client = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: activeAssistant.model.baseUrl,
        apiKey: window.api.decrypt(settingsStore.openAiApiKey)
      });
      const stream = await client.chat.completions.create({
        stream: true,
        model: activeAssistant.modelId,
        messages: prepareMessages({
          chats: activeConversation?.chats,
          assistant: activeAssistant,
          input: data.input
        })
      });

      // stream chat
      let fullText = '';
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        setMessages((prev) => [...prev, text]);
        fullText += text;
      }

      // update chat when stream finish
      await db.chat.update(chatId, { assistant: fullText, receivedAt: Date.now() });
      setTimeout(() => {
        setFocus('input');
      }, INPUT_REFOCUS_DELAY_MS);
    },
    [activeAssistant, activeConversation, settingsStore]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.shiftKey && event.key === 'Enter') {
        if (!isSubmitting) handleSubmit(onSubmit)();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSubmitting, handleSubmit, onSubmit]);

  return (
    <>
      <div className="px-6 py-2 flex-grow overflow-auto" ref={scrollRef}>
        {activeConversation ? (
          <>
            <Conversation chats={activeConversation.chats} />
            {messages.length > 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble">{messages.join('')}</div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full pt-12 flex justify-center items-center">
            <div className="space-y-4">
              <img
                width={200}
                height={200}
                alt="onboarding"
                src="/andy-note.png"
                className="mx-auto"
              />
              <p className="text-sm">Write something below to start a conversation</p>
            </div>
          </div>
        )}
      </div>
      <form
        className="m-6 mt-0 flex-none"
        onSubmit={activeAssistant ? handleSubmit(onSubmit) : undefined}
      >
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Your message</legend>
          <textarea
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
  const FORMAT = 'hh:mm:ss A, DD/MM/YYYY';
  return chats.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-start space-y-1">
        <Markdown
          className="chat-bubble chat-bubble-primary"
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {chat.user}
        </Markdown>
        <div className="chat-footer opacity-50">{dayjs(chat.sentAt).format(FORMAT)}</div>
      </div>
      {chat.assistant && (
        <div className="chat chat-end space-y-1">
          <Markdown
            className="chat-bubble"
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {chat.assistant}
          </Markdown>
          <div className="chat-footer opacity-50">{dayjs(chat.receivedAt).format(FORMAT)}</div>
        </div>
      )}
    </div>
  ));
}
