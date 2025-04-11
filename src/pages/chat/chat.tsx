import andyNote from "@assets/andy-note.png";
import useChat from "@hooks/use-chat";
import { parseThinkingReply, TIME_FORMAT } from "@lib/chat";
import db from "@lib/database";
import { getActiveModel, getConversation, prepareMessages } from "@lib/model";
import {
  ChatWithDetails,
  ConversationWithDetails,
  ModelWithDetails,
  Prompt,
} from "@lib/model.types";
import useSettings from "@store/settings";
import { IconChevronDown } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import OpenAI from "openai";
import { useCallback, useEffect, useRef } from "react";
import { MarkdownRenderer } from "./markdown";

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chats() {
  const settingsStore = useSettings();

  const activeModel: ModelWithDetails | undefined = useLiveQuery(
    async () => await getActiveModel()
  );

  const promptList: Prompt[] | undefined = useLiveQuery(
    async () => await db.prompt.toArray()
  );

  const activePrompt: Prompt | undefined = useLiveQuery(
    async () =>
      settingsStore.activePromptId
        ? await db.prompt.get(settingsStore.activePromptId)
        : undefined,
    [settingsStore.activePromptId]
  );

  const activeConversation: ConversationWithDetails | undefined = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId]
  );

  const {
    form: { reset, register, handleSubmit, isLoading, isSubmitting, setFocus },
    isThinking,
    messages,
    setMessages,
  } = useChat();

  // autoscroll
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [isSubmitting, messages, activeConversation?.chats]);
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, []);

  const onSubmit = useCallback(
    async (data: { input: string }) => {
      if (!activeModel) return;

      // create chat
      const isNewConversation = !!activeConversation;
      const conversationId = activeConversation
        ? activeConversation.id
        : await db.conversation.add({
            title: data.input,
            createdAt: Date.now(),
          });
      const chatId = await db.chat.add({
        conversationId,
        user: data.input,
        sendAt: Date.now(),
        modelId: activeModel.id,
        promptId: activePrompt?.id,
      });
      settingsStore.setActiveConversation(conversationId);

      // send chat request
      let fullText = "";
      try {
        const client = new OpenAI({
          dangerouslyAllowBrowser: true,
          baseURL: activeModel.provider.baseURL,
          apiKey: activeModel.provider.apiKey,
        });
        const stream = await client.chat.completions.create({
          stream: true,
          model: activeModel.id,
          messages: prepareMessages({
            chats: activeConversation?.chats ?? [],
            system: activePrompt?.prompt ?? "",
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
    [activeModel, activeConversation, settingsStore]
  );

  const onSelectPrompt = (promptId?: number) => {
    settingsStore.setActivePrompt(promptId);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isSubmitting) handleSubmit(onSubmit)();
      } else if (event.ctrlKey && event.key === "n") {
        if (activeConversation) {
          settingsStore.setActiveConversation(undefined);
          setTimeout(() => {
            setFocus("input");
          }, INPUT_REFOCUS_DELAY_MS);
        }
        reset();
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
                <div className="chat-bubble prose">
                  <MarkdownRenderer>
                    {parseThinkingReply(messages.join(""))}
                  </MarkdownRenderer>
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
            </div>
          </div>
        )}
      </div>
      <form
        className="mx-6 mt-0 mb-2 flex-none"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset className="fieldset">
          <legend className="fieldset-legend">
            <div className="dropdown dropdown-top">
              <div tabIndex={0} role="button" className="m-1 flex items-center">
                <div className="flex flex-col me-3">
                  {promptList?.find(
                    (prompt) => prompt.id === settingsStore.activePromptId
                  )?.title ?? "No prompt"}
                </div>
                <IconChevronDown className="w-4 h-4" />
              </div>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-200 rounded-box z-1 w-max shadow-sm"
              >
                <li>
                  <button
                    type="button"
                    className={`flex items-center ${
                      !settingsStore.activePromptId ? "text-primary" : ""
                    }`}
                    onClick={() => onSelectPrompt(undefined)}
                  >
                    <div className="flex flex-col">No prompt</div>
                  </button>
                </li>
                {promptList?.map((prompt) => (
                  <li key={prompt.id}>
                    <button
                      type="button"
                      className={`flex items-center ${
                        settingsStore.activePromptId === prompt.id
                          ? "text-primary"
                          : ""
                      }`}
                      onClick={() => onSelectPrompt(prompt.id)}
                    >
                      <div className="flex flex-col">{prompt.title}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </legend>
          <textarea
            autoFocus
            id="chatInput"
            disabled={isSubmitting || isLoading}
            className="textarea w-full"
            placeholder="Write here"
            {...register("input")}
          />
          <div>
            <div className="fieldset-label hidden sm:block">
              Enter to submit. Shift+Enter to newline. Ctrl+n to new
              conversation.
            </div>
            <div className="fieldset-label">
              Not all models support chat completions. Model response can make
              mistakes and always verify info.
            </div>
          </div>
        </fieldset>
      </form>
    </>
  );
}

function Conversation({ chats }: Readonly<{ chats: ChatWithDetails[] }>) {
  return chats.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-start space-y-1">
        <div className="chat-bubble chat-bubble-primary prose markdown">
          <MarkdownRenderer>{chat.user}</MarkdownRenderer>
        </div>
        <div className="chat-footer opacity-50">
          {[dayjs(chat.sendAt).format(TIME_FORMAT), chat.prompt?.title]
            .filter((s) => !!s)
            .join(", ")}
        </div>
      </div>
      {chat.assistant && (
        <div className="chat chat-end space-y-1">
          <div className="chat-bubble prose markdown">
            <MarkdownRenderer>{chat.assistant}</MarkdownRenderer>
          </div>
          <div className="chat-footer opacity-50">
            {[dayjs(chat.receivedAt).format(TIME_FORMAT), chat.modelId]
              .filter((s) => !!s)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  ));
}
