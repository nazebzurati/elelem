import andyNote from "@assets/andy-note.png";
import CopyButton from "@components/copy-button";
import {
  Chat,
  ChatWithDetails,
  getChatListByRefId,
  getPreviousChatList,
} from "@database/chat";
import db from "@database/config";
import { getModelList, Model } from "@database/model";
import { getPromptList, Prompt } from "@database/prompt";
import useChat from "@hooks/use-chat";
import useAlertStore, { AlertTypeEnum } from "@stores/alert";
import useChatStore from "@stores/chat";
import useSettingsStore from "@stores/settings";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconEdit,
  IconSend2,
  IconX,
} from "@tabler/icons-react";
import {
  parseThinkingReply,
  prepareMessages,
  TIME_FORMAT,
} from "@utils/conversation";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import OpenAI from "openai";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { MarkdownRenderer } from "./markdown";

const INPUT_REFOCUS_DELAY_MS = 250;

export default function Chats() {
  const chatStore = useChatStore();
  const alertStore = useAlertStore();
  const settingsStore = useSettingsStore();

  const modelList = useLiveQuery(async () => await getModelList());
  const promptList = useLiveQuery(async () => await getPromptList());

  const useChatRef = useChat({
    modelList: modelList ?? [],
    promptList: promptList ?? [],
  });

  const {
    form: { register, handleSubmit, isLoading, isSubmitting, setFocus },
    chat: { activeModel, activePrompt, activeConversation },
    isThinking,
    messages,
    setMessages,
  } = useChatRef;

  const onInputSubmit = useCallback(
    async (data: { input: string }) => {
      if (!activeModel?.provider) {
        alertStore.add({
          type: AlertTypeEnum.ERROR,
          message: "Please select a model to proceed.",
        });
        return;
      }

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
        parentId: activeConversation?.chats.sort((a, b) => b.id - a.id)[0].id,
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
        settingsStore.setActiveConversation();
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

  // shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !chatStore.selectedChatId
      ) {
        event.preventDefault();
        if (!isSubmitting) handleSubmit(onInputSubmit)();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, handleSubmit, onInputSubmit, chatStore.selectedChatId]);

  return (
    <>
      <div className="px-6 py-2 flex-grow overflow-auto" ref={scrollRef}>
        {activeConversation ? (
          <>
            <ChatBubbles
              useChatRef={useChatRef}
              chats={activeConversation.chats}
            />
            {isSubmitting && messages.length <= 0 && (
              <div className="chat chat-start space-y-1">
                <div className="chat-bubble">
                  <span className="loading loading-dots loading-sm" />
                </div>
              </div>
            )}
            {isThinking && (
              <div className="chat chat-start space-y-1">
                <div className="chat-bubble italic">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            {!isThinking && messages.length > 0 && (
              <div className="chat chat-start space-y-1">
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
      <form
        className="m-2 flex-none"
        onSubmit={
          !chatStore.selectedChatId ? handleSubmit(onInputSubmit) : undefined
        }
      >
        <div className="card bg-base-200">
          <div className="card-body p-2">
            {chatStore.selectedChatId ? (
              <textarea
                disabled
                className="textarea textarea-ghost resize-none w-full border-0 focus:outline-none focus:ring-0 focus:bg-transparent"
                placeholder="Chat is disabled while editing a message"
                value=""
              />
            ) : (
              <textarea
                autoFocus
                id="chatInput"
                disabled={isSubmitting || isLoading}
                className="textarea textarea-ghost resize-none w-full border-0 focus:outline-none focus:ring-0 focus:bg-transparent"
                placeholder="Write here"
                value={isSubmitting || isLoading ? "" : undefined}
                {...(isSubmitting || isLoading ? {} : register("input"))}
              />
            )}

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
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="btn btn-ghost btn-circle"
                >
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

function ChatBubbles({
  useChatRef,
  chats,
}: Readonly<{
  useChatRef: any;
  chats: ChatWithDetails[];
}>) {
  const chatStore = useChatStore();
  const alertStore = useAlertStore();

  const {
    form: { register, handleSubmit, setFocus, setValue },
    chat: { activeModel, activePrompt, activeChat },
    setMessages,
  } = useChatRef;

  const chatsWithAlt: (ChatWithDetails & { alt: number[] })[] = useMemo(() => {
    return getChatListByRefId(chats, chatStore.chatRefId).map((chat) => {
      const alt = chats
        .filter((c) => c.parentId === chat.parentId)
        .map((c) => c.id)
        .sort((a, b) => a - b);
      return { ...chat, alt: alt.length > 1 ? alt : [] };
    });
  }, [chats, chatStore.chatRefId]);

  const onEditChat = (chat: Chat) => {
    setValue("input", chat.user);
    chatStore.setSelectedChat(chat.id);
  };

  const onEditChatSubmit = useCallback(
    async (data: { input: string }) => {
      if (!activeModel?.provider) {
        alertStore.add({
          type: AlertTypeEnum.ERROR,
          message: "Please select a model to proceed.",
        });
        return;
      }

      if (!chatStore.selectedChatId) {
        alertStore.add({
          type: AlertTypeEnum.ERROR,
          message: "Chat is invalid.",
        });
        return;
      }

      // get current selected chat
      const selectedChat = await db.chat.get(chatStore.selectedChatId);
      if (!selectedChat) {
        alertStore.add({
          type: AlertTypeEnum.ERROR,
          message: "Chat is not found.",
        });
        return;
      }

      // create chat
      const chatId = await db.chat.add({
        conversationId: selectedChat.conversationId,
        user: data.input,
        sendAt: Date.now(),
        modelId: activeModel.id,
        parentId: selectedChat?.parentId,
        promptId: activePrompt?.id,
      });
      chatStore.setSelectedChatRefId(chatId);
      chatStore.setSelectedChat();

      // get history
      const chats: Chat[] = await getPreviousChatList(
        selectedChat.conversationId,
        selectedChat.parentId,
      );

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
            chats,
            system: activePrompt?.prompt ?? "",
            input: data.input,
          }),
        });

        // stream chat
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          setMessages((prev: string[]) => [...prev, text]);
          fullText += text;
        }
      } catch (_error) {
        await db.chat.delete(chatId);
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
    [activeModel, activeChat, chatStore],
  );

  const onEditChatCancel = () => {
    setValue("input", "");
    chatStore.setSelectedChat();
  };

  // shortcut listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        chatStore.selectedChatId
      ) {
        event.preventDefault();
        handleSubmit(onEditChatSubmit)();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit, onEditChatSubmit, chatStore.selectedChatId]);

  return chatsWithAlt.map((chat) => (
    <div key={chat.id}>
      <div className="chat chat-end space-y-2">
        <div className="chat-header">
          <div className="flex justify-between items-center">
            <time className="text-xs opacity-50 me-2">
              {dayjs(chat.sendAt).format(TIME_FORMAT)}
            </time>
            You
          </div>
        </div>
        <div
          className={`chat-bubble markdown ${chatStore.selectedChatId === chat.id ? "w-full" : ""}`}
        >
          {chatStore.selectedChatId === chat.id ? (
            <form
              id={`chatUpdateForm_${chat.id}`}
              onSubmit={handleSubmit(onEditChatSubmit)}
            >
              <textarea
                className={`textarea max-h-none ${chatStore.selectedChatId === chat.id ? "w-full" : ""}`}
                {...register("input")}
              />
              <div className="text-xs label whitespace-normal break-words">
                Updating this chat will create a new branch of conversation from
                here.
              </div>
            </form>
          ) : (
            <MarkdownRenderer>{chat.user}</MarkdownRenderer>
          )}
        </div>
        <div className="chat-footer justify-end space-x-2">
          {chatStore.selectedChatId !== chat.id ? (
            <button className="cursor-pointer" onClick={() => onEditChat(chat)}>
              <IconEdit className="text-xs w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                className="cursor-pointer"
                form={`chatUpdateForm_${chat.id}`}
              >
                <IconCheck className="text-xs w-4 h-4 text-success" />
              </button>
              <button className="cursor-pointer" onClick={onEditChatCancel}>
                <IconX className="text-xs w-4 h-4 text-error" />
              </button>
            </>
          )}
          <CopyButton text={chat.user} />{" "}
          <div className="flex space-x-1">
            {chatStore.selectedChatId !== chat.id && chat.alt.length > 0 && (
              <AlternateChatSelector
                chatId={chat.id}
                chatAlternateIds={chat.alt}
              />
            )}
          </div>
        </div>
      </div>
      {chat.assistant && (
        <div className="chat chat-start space-y-2">
          <div className="chat-header">
            {chat.modelId} ({chat.prompt?.title ?? "No prompt"})
            <time className="ms-2 text-xs opacity-50">
              {dayjs(chat.receivedAt).format(TIME_FORMAT)}
            </time>
          </div>
          <div className="chat-bubble markdown">
            <MarkdownRenderer>{chat.assistant}</MarkdownRenderer>
          </div>
          <div className="chat-footer space-x-2">
            <div className="flex space-x-1">
              {chat.alt.length > 0 && (
                <AlternateChatSelector
                  chatId={chat.id}
                  chatAlternateIds={chat.alt}
                />
              )}
            </div>
            <CopyButton text={chat.assistant} />
          </div>
        </div>
      )}
    </div>
  ));
}

function AlternateChatSelector({
  chatId,
  chatAlternateIds,
}: {
  chatId: number;
  chatAlternateIds: number[];
}) {
  const chatStore = useChatStore();

  const currentIndex = useMemo(() => {
    return chatAlternateIds.indexOf(chatId);
  }, [chatAlternateIds, chatStore.chatRefId]);

  const isPreviousAvailable = currentIndex > 0;
  const isNextAvailable = currentIndex < chatAlternateIds.length - 1;

  const onPrevious = () => {
    if (!isPreviousAvailable) return;
    chatStore.setSelectedChatRefId(chatAlternateIds[currentIndex - 1]);
  };

  const onNext = () => {
    if (!isNextAvailable) return;
    chatStore.setSelectedChatRefId(chatAlternateIds[currentIndex + 1]);
  };

  return (
    <>
      <button
        className="cursor-pointer disabled:text-gray-600"
        disabled={!isPreviousAvailable}
        onClick={onPrevious}
      >
        <IconChevronLeft className="text-xs w-4 h-4" />
      </button>
      <span>
        {currentIndex + 1} / {chatAlternateIds.length}
      </span>
      <button
        className="cursor-pointer disabled:text-gray-600"
        disabled={!isNextAvailable}
        onClick={onNext}
      >
        <IconChevronRight className="text-xs w-4 h-4" />
      </button>
    </>
  );
}

function PromptSelector({
  promptList,
  activePrompt,
}: {
  promptList?: Prompt[];
  activePrompt?: Prompt;
}) {
  const dropdownRef = useRef<HTMLDetailsElement>(null);

  const settingsStore = useSettingsStore();
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
            <button type="button" onClick={() => onSelectPrompt()}>
              No prompt
            </button>
          </li>
          {promptList?.map((prompt) => (
            <li
              className={activePrompt?.id === prompt.id ? "text-primary" : ""}
              key={prompt.id}
            >
              <button type="button" onClick={() => onSelectPrompt(prompt.id)}>
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

  const settingsStore = useSettingsStore();
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
              <button type="button" onClick={() => onSelectModel(model.id)}>
                {model.id}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
