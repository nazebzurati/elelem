import "katex/dist/katex.min.css";

import andyNote from "@assets/andy-note.png";
import useChat from "@hooks/use-chat";
import { parseThinkingReply, TIME_FORMAT } from "@lib/chat";
import db from "@lib/database";
import { prepareMessages } from "@lib/model";
import { Chat } from "@lib/model.types";
import useSettings from "@store/settings";
import dayjs from "dayjs";
import OpenAI from "openai";
import { useCallback, useEffect } from "react";
import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chats() {
  const settingsStore = useSettings();
  const {
    form: { register, handleSubmit, isLoading, isSubmitting, setFocus },
    scrollRef,
    activeModel,
    activePrompt,
    activeConversation,
    isThinking,
    messages,
    setMessages,
  } = useChat();

  const onSubmit = useCallback(
    async (data: { input: string }) => {
      if (!activeModel) return;

      // create chat
      const isNewConversation = !!activeConversation;
      const conversationId = activeConversation
        ? activeConversation.id
        : await db.conversation.add({
            title: data.input,
          });
      const chatId = await db.chat.add({
        conversationId,
        user: data.input,
        sendAt: Date.now(),
        modelId: activeModel.id,
      });
      settingsStore.setActiveConversation(conversationId);

      // send chat request
      let fullText = "";
      try {
        const client = new OpenAI({
          dangerouslyAllowBrowser: true,
          baseURL: activeModel.baseURL,
          apiKey: activeModel.apiKey,
        });
        const stream = await client.chat.completions.create(
          {
            stream: true,
            model: activeModel.id,
            messages: prepareMessages({
              chats: activeConversation?.chats ?? [],
              system: activePrompt?.prompt ?? "",
              input: data.input,
            }),
          },
          { headers: { "x-stainless-timeout": null } }
        );

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
    [activeModel, activeConversation, settingsStore]
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

  useEffect(() => {
    if (isSubmitting) {
      const textarea = document.getElementById(
        "chatInput"
      ) as HTMLTextAreaElement | null;
      textarea?.setAttribute("style", "");
    }
  }, [isSubmitting]);

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
                <div className="chat-bubble prose markdown">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {parseThinkingReply(messages.join(""))}
                  </Markdown>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex justify-center items-center">
            <div className="space-y-4">
              <img
                width={150}
                height={150}
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
        onSubmit={activeModel ? handleSubmit(onSubmit) : undefined}
      >
        <fieldset className="fieldset">
          <textarea
            autoFocus
            id="chatInput"
            disabled={isSubmitting || isLoading}
            className="textarea w-full"
            placeholder="Ask me anything .."
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
        <div className="chat-bubble chat-bubble-primary prose markdown">
          <Markdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {chat.user}
          </Markdown>
        </div>
        <div className="chat-footer opacity-50">
          {dayjs(chat.sendAt).format(TIME_FORMAT)}
        </div>
      </div>
      {chat.assistant && (
        <div className="chat chat-end space-y-1">
          <div className="chat-bubble prose markdown">
            <Markdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {parseThinkingReply(chat.assistant)}
            </Markdown>
          </div>
          <div className="chat-footer opacity-50">
            {dayjs(chat.receivedAt).format(TIME_FORMAT)}
          </div>
        </div>
      )}
    </div>
  ));
}
