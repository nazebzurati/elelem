import "katex/dist/katex.min.css";

import dayjs from "dayjs";
import OpenAI from "openai";
import { useCallback, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import andyNote from "@assets/andy-note.png";
import useChat from "@hooks/use-chat";
import { getReply, TIME_FORMAT } from "@lib/chat";
import db from "@lib/database";
import { prepareMessages } from "@lib/model";
import useSettings from "@store/settings";
import { Chat } from "@lib/model.types";

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chats() {
  const settingsStore = useSettings();
  const {
    form: { register, handleSubmit, isLoading, isSubmitting, setFocus },
    scrollRef,
    activeAssistant,
    activeConversation,
    isThinking,
    messages,
    setMessages,
  } = useChat();

  const onSubmit = useCallback(
    async (data: { input: string }) => {
      if (!activeAssistant) return;

      // create chat
      const isNewConversation = !!activeConversation;
      const conversationId = activeConversation
        ? activeConversation.id
        : await db.conversation.add({
            assistantId: activeAssistant.id,
            title: data.input,
          });
      const chatId = await db.chat.add({
        conversationId,
        user: data.input,
        sendAt: Date.now(),
      });
      settingsStore.setActiveConversation(conversationId);

      // send chat request
      let fullText = "";
      try {
        const client = new OpenAI({
          dangerouslyAllowBrowser: true,
          baseURL: activeAssistant.model?.baseUrl,
          apiKey: settingsStore.openAiApiKey,
        });
        const stream = await client.chat.completions.create({
          stream: true,
          model: activeAssistant.modelId,
          messages: prepareMessages({
            chats: activeConversation?.chats ?? [],
            system: activeAssistant.prompt ?? "",
            input: data.input,
          }),
        });

        // stream chat
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          setMessages((prev) => [...prev, text]);
          fullText += text;
        }
      } catch (_error) {
        await db.chat.delete(chatId);
        if (isNewConversation) await db.conversation.delete(conversationId);
        settingsStore.setActiveConversation(undefined);
      }

      // update chat when stream finish
      await db.chat.update(chatId, {
        assistant: fullText,
        receivedAt: Date.now(),
      });
      setTimeout(() => {
        setFocus("input");
      }, INPUT_REFOCUS_DELAY_MS);
    },
    [activeAssistant, activeConversation, settingsStore]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isSubmitting) handleSubmit(onSubmit)();
      } else if (event.ctrlKey && event.key === "n") {
        if (settingsStore.activeConversationId) {
          settingsStore.setActiveConversation(undefined);
          setTimeout(() => {
            setFocus("input");
          }, INPUT_REFOCUS_DELAY_MS);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, handleSubmit, onSubmit]);

  return (
    <>
      <div className="px-6 py-2 flex-grow overflow-auto" ref={scrollRef}>
        {activeConversation ? (
          <>
            <Conversation chats={activeConversation.chats} />
            {isSubmitting && messages.length <= 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
            {isThinking && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble italic">
                  <span className="loading loading-ring loading-xs me-2"></span>
                  Thinking...
                </div>
              </div>
            )}
            {!isThinking && messages.length > 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble">
                  <Markdown>{messages.join("")}</Markdown>
                </div>
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
                src={andyNote}
                className="mx-auto"
              />
              <p className="text-sm">
                Write something below to start a conversation
              </p>
            </div>
          </div>
        )}
      </div>
      <form
        className="m-6 mt-0 flex-none"
        onSubmit={activeAssistant ? handleSubmit(onSubmit) : undefined}
      >
        <fieldset className="fieldset">
          <div>
            <legend className="fieldset-legend">Your message</legend>
          </div>
          <textarea
            autoFocus
            disabled={isSubmitting || isLoading}
            className="textarea w-full"
            {...register("input")}
          />
          <div className="fieldset-label">
            Enter to submit. Shift+Enter to newline.
          </div>
        </fieldset>
      </form>
    </>
  );
}

function Conversation({ chats }: Readonly<{ chats: Chat[] }>) {
  return chats.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-start space-y-1">
        <div className="chat-bubble chat-bubble-primary">
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {chat.user}
          </Markdown>
        </div>
        <div className="chat-footer opacity-50">
          {dayjs(chat.sendAt).format(TIME_FORMAT)}
        </div>
      </div>
      {chat.assistant && (
        <div className="chat chat-end space-y-1">
          <div className="chat-bubble">
            <div className="p-0">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {getReply(chat.assistant)}
              </Markdown>
            </div>
          </div>
          <div className="chat-footer opacity-50">
            {dayjs(chat.receivedAt).format(TIME_FORMAT)}
          </div>
        </div>
      )}
    </div>
  ));
}
