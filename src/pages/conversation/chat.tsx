import andyNote from "@assets/andy-note.png";
import useChat from "@hooks/use-chat";
import { parseThinkingReply, TIME_FORMAT } from "@lib/conversation";
import db from "@lib/database";
import { getConversation, getModelList, prepareMessages } from "@lib/model";
import {
  ChatWithDetails,
  ConversationWithDetails,
  Model,
  ModelWithDetails,
  Prompt,
} from "@lib/model.types";
import useSettings from "@store/settings";
import { IconChevronUp, IconSend2 } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import OpenAI from "openai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MarkdownRenderer } from "./markdown";

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chats() {
  const settingsStore = useSettings();

  const modelList: ModelWithDetails[] = useLiveQuery(async () =>
    getModelList(),
  );

  const activeModel: ModelWithDetails | undefined = useLiveQuery(async () => {
    return !modelList || !settingsStore.activeModelId
      ? undefined
      : modelList.find((p) => p.id === settingsStore.activeModelId);
  }, [modelList, settingsStore.activeModelId]);

  const promptList: Prompt[] | undefined = useLiveQuery(
    async () => await db.prompt.toArray(),
  );

  const activePrompt: Prompt | undefined = useMemo(() => {
    return !promptList || !settingsStore.activePromptId
      ? undefined
      : promptList.find((p) => p.id === settingsStore.activePromptId);
  }, [promptList, settingsStore.activePromptId]);

  const activeConversation: ConversationWithDetails | undefined = useLiveQuery(
    async () =>
      settingsStore.activeConversationId
        ? await getConversation(settingsStore.activeConversationId)
        : undefined,
    [settingsStore.activeConversationId],
  );

  const {
    form: { register, handleSubmit, isLoading, isSubmitting, setFocus },
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
      console.log(activeModel);
      if (!activeModel?.provider) return;

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
          const text = chunk.choices[0]?.delta?.content ?? "";
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
        assistant: fullText.replace(/<think>[\s\S]*?<\/think>/, ""),
        receivedAt: Date.now(),
      });
      setTimeout(() => {
        setFocus("input");
      }, INPUT_REFOCUS_DELAY_MS);
    },
    [activeModel, activeConversation, settingsStore],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (!isSubmitting) handleSubmit(onSubmit)();
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
        "chatInput",
      ) as HTMLTextAreaElement | null;
      textarea?.setAttribute("style", "");
    }
  }, [isSubmitting]);

  return (
    <>
      <div className="px-6 py-2 flex-grow overflow-auto" ref={scrollRef}>
        {activeConversation ? (
          <>
            <ChatBubbles chats={activeConversation.chats} />
            {isSubmitting && messages.length <= 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm" />
                </div>
              </div>
            )}
            {isThinking && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble italic">
                  <span className="loading loading-ring loading-xs" />{" "}
                  Thinking...
                </div>
              </div>
            )}
            {!isThinking && messages.length > 0 && (
              <div className="chat chat-end space-y-1">
                <div className="chat-bubble markdown">
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
      <form className="m-2 flex-none" onSubmit={handleSubmit(onSubmit)}>
        <div className="card bg-base-200">
          <div className="card-body p-2">
            <textarea
              autoFocus
              id="chatInput"
              disabled={isSubmitting || isLoading}
              className="textarea textarea-ghost resize-none w-full border-0 focus:outline-none focus:ring-0 focus:bg-transparent"
              placeholder="Write here"
              {...register("input")}
            />
            <div className="flex justify-between items-center w-full">
              <div>
                <ModelSelector
                  modelList={modelList}
                  activeModel={activeModel}
                />
                <PromptSelector
                  promptList={promptList}
                  activePrompt={activePrompt}
                />
              </div>
              <div>
                <button className="btn btn-ghost btn-circle">
                  <IconSend2 className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function ChatBubbles({ chats }: Readonly<{ chats: ChatWithDetails[] }>) {
  return chats.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-end space-y-1">
        <div className="chat-bubble chat-bubble-primary markdown">
          <MarkdownRenderer>{chat.user}</MarkdownRenderer>
        </div>
        <div className="chat-footer opacity-50">
          {dayjs(chat.sendAt).format(TIME_FORMAT)} (
          {chat.prompt?.title ?? "No prompt"})
        </div>
      </div>
      {chat.assistant && (
        <div className="chat chat-start space-y-1">
          <div className="chat-bubble markdown">
            <MarkdownRenderer>{chat.assistant}</MarkdownRenderer>
          </div>
          <div className="chat-footer opacity-50">
            {dayjs(chat.receivedAt).format(TIME_FORMAT)} ({chat.modelId})
          </div>
        </div>
      )}
    </div>
  ));
}

function PromptSelector({
  promptList,
  activePrompt,
}: {
  promptList?: Prompt[];
  activePrompt?: Prompt;
}) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const settingsStore = useSettings();
  const onSelectPrompt = (promptId?: number) => {
    settingsStore.setActivePrompt(promptId);
    dropdownRef.current?.removeAttribute("open");
  };

  const onBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      dropdownRef.current?.removeAttribute("open");
    }
  };

  return (
    <details
      onBlur={onBlur}
      ref={dropdownRef}
      className="dropdown dropdown-top"
    >
      <summary className="list-none px-4 flex items-center gap-1 w-32 sm:w-44">
        <span className="flex-1 line-clamp-1">
          {activePrompt?.title ?? "No prompt"}
        </span>
        <IconChevronUp className="h-4 w-4" />
      </summary>
      <div className="dropdown-content max-h-60 overflow-y-auto w-max rounded-md mb-2">
        <ul className="menu bg-base-300">
          <li className={!activePrompt ? "text-primary" : ""}>
            <button onClick={() => onSelectPrompt()}>No prompt</button>
          </li>
          {promptList?.map((prompt) => (
            <li
              className={activePrompt?.id === prompt.id ? "text-primary" : ""}
              key={prompt.id}
            >
              <button onClick={() => onSelectPrompt(prompt.id)}>
                {prompt.title}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

function ModelSelector({
  modelList,
  activeModel,
}: {
  modelList?: Model[];
  activeModel?: Model;
}) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const settingsStore = useSettings();
  const onSelectModel = (modelId?: string) => {
    settingsStore.setActiveModel(modelId);
    dropdownRef.current?.removeAttribute("open");
  };

  const onBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (!dropdownRef.current?.contains(event.relatedTarget as Node)) {
      dropdownRef.current?.removeAttribute("open");
    }
  };

  return (
    <details
      onBlur={onBlur}
      ref={dropdownRef}
      className="dropdown dropdown-top"
    >
      <summary className="list-none px-4 flex items-center gap-1 w-32 sm:w-44">
        <span className="flex-1 line-clamp-1">
          {activeModel?.id ?? "Select a model"}
        </span>
        <IconChevronUp className="h-4 w-4" />
      </summary>
      <div className="dropdown-content max-h-60 overflow-y-auto w-max rounded-md mb-2">
        <ul className="menu bg-base-300">
          {modelList?.map((model) => (
            <li
              className={activeModel?.id === model.id ? "text-primary" : ""}
              key={model.id}
            >
              <button onClick={() => onSelectModel(model.id)}>
                {model.id}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
