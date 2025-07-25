import CopyButton from "@components/copy-button";
import {
  Chat,
  ChatReplyTypeEnum,
  ChatWithDetails,
  getAltChat,
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
  IconReload,
  IconSend2,
  IconX,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { listen, once } from "@tauri-apps/api/event";
import {
  prepareMessages,
  removeThoughtFromReply,
  TIME_FORMAT,
} from "@utils/conversation";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useRef } from "react";
import { MarkdownRenderer } from "./markdown";

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
    form: { register, handleSubmit, isLoading, isSubmitting },
    chat: { activeModel, activePrompt, activeConversation, activeChat },
    isThinking,
    thoughts,
    messages,
    setMessages,
  } = useChatRef;

  const onInputSubmit = async (data: { input: string }) => {
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
      parentId: activeChat?.id,
      replyType: ChatReplyTypeEnum.NEW,
      promptId: activePrompt?.id,
    });
    settingsStore.setActiveConversation(conversationId);

    // send chat request
    let fullText = "";
    try {
      // setup a stream listener and its cleanup
      const streamCleanUp = await listen<string>("chat_stream", (stream) => {
        const text = stream.payload as string;
        if (!text) return;
        setMessages((prev: string[]) => [...prev, text]);
        fullText += text;
      });

      // trigger get_chat_completion
      await invoke("get_chat_completion", {
        base_url: activeModel.provider.baseURL,
        api_key: activeModel.provider.apiKey,
        model_id: activeModel.id,
        messages: prepareMessages({
          chats: activeConversation?.chats ?? [],
          system: activePrompt?.prompt ?? "",
          input: data.input,
        }),
      });

      // wait chat_complete and cleanup
      await once("chat_complete", () => {});
      streamCleanUp();
    } catch (_error) {
      await db.chat.delete(chatId);
      if (isNewConversation) await db.conversation.delete(conversationId);
      chatStore.setSelectedChat();
      chatStore.setSelectedChatRefId();
      settingsStore.setActiveConversation();
    }

    // update chat when stream finish
    await db.chat.update(chatId, {
      assistant: fullText.replace(/<think>[\s\S]*?<\/think>/, ""),
      receivedAt: Date.now(),
    });
  };

  // autoscroll
  const inputRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const paddingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!inputRef.current || !paddingRef.current || !scrollRef.current) return;

    // get height
    const elements = scrollRef.current.querySelectorAll(".elelem-chat");
    const lastElement = elements[elements.length - 1] as HTMLElement;
    const lastElementHeight = lastElement?.offsetHeight ?? 0;
    const scrollableAreaHeight = scrollRef.current.clientHeight;
    if (scrollableAreaHeight >= scrollRef.current.scrollHeight) return;

    // resize height and scrolled into
    const paddingHeight = 30;
    const inputAreaHeight = inputRef.current.offsetHeight;
    const remainingHeight =
      scrollableAreaHeight -
      lastElementHeight -
      inputAreaHeight +
      paddingHeight;
    paddingRef.current.style.height = `${remainingHeight}px`;
    lastElement?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeChat]);

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
      {activeConversation ? (
        <div className="px-6 py-2 flex-grow overflow-auto" ref={scrollRef}>
          <ChatBubbles
            useChatRef={useChatRef}
            chats={activeConversation.chats}
          />
          {isSubmitting && messages.length <= 0 && (
            <div className="chat chat-start space-y-2">
              <div className="chat-header">Sending...</div>
              <div className="chat-bubble">
                <span className="loading loading-dots loading-sm" />
              </div>
            </div>
          )}
          {isThinking && (
            <div className="chat chat-start space-y-2">
              <div className="chat-header">Thinking...</div>
              <div className="chat-bubble markdown">
                <MarkdownRenderer>{thoughts.join("")}</MarkdownRenderer>
              </div>
            </div>
          )}
          {!isThinking && messages.length > 0 && (
            <div className="chat chat-start space-y-2">
              <div className="chat-header">Replying...</div>
              <div className="chat-bubble markdown">
                <MarkdownRenderer>
                  {removeThoughtFromReply(messages.join(""))}
                </MarkdownRenderer>
              </div>
            </div>
          )}
          <div ref={paddingRef} />
        </div>
      ) : (
        <div className="h-full flex justify-center items-center">
          <p className="text-xl font-bold">Hello! How can I help?</p>
        </div>
      )}
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
                id="chatInput"
                disabled={isSubmitting || isLoading}
                className="textarea textarea-ghost resize-none w-full border-0 focus:outline-none focus:ring-0 focus:bg-transparent"
                placeholder="Write here"
                value={isSubmitting || isLoading ? "" : undefined}
                {...(isSubmitting || isLoading ? {} : register("input"))}
              />
            )}
            <div
              ref={inputRef}
              className="flex justify-between items-center w-full"
            >
              <div className="flex">
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
    form: { register, handleSubmit, setValue },
    chat: { activeModel, activePrompt },
    setMessages,
  } = useChatRef;

  const chatsWithAlt: (ChatWithDetails & {
    alt: ChatWithDetails[];
  })[] = useMemo(() => {
    return getChatListByRefId(chats, chatStore.chatRefId).map((chat) => {
      const alt = chats
        .filter((c) => c.parentId === chat.parentId)
        .sort((a, b) => a.id - b.id);
      return { ...chat, alt: alt.length > 1 ? alt : [] };
    });
  }, [chats, chatStore.chatRefId]);

  useEffect(() => {
    if (!chatStore.selectedChatId) return;
    if (chatStore.selectedChatType === ChatReplyTypeEnum.EDIT_CHAT_RETRY) {
      handleSubmit(onRetrySubmit)();
    }
  }, [chatStore.selectedChatId, chatStore.selectedChatType]);

  const onRetry = (chat: Chat) => {
    setValue("input", chat.user);
    chatStore.setSelectedChat(chat.id, ChatReplyTypeEnum.EDIT_CHAT_RETRY);
  };

  const onRetrySubmit = async () => {
    if (chatStore.selectedChatType !== ChatReplyTypeEnum.EDIT_CHAT_RETRY) {
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
      user: selectedChat.user,
      sendAt: Date.now(),
      modelId: activeModel?.id ?? selectedChat.modelId,
      parentId: selectedChat.parentId,
      replyType: ChatReplyTypeEnum.EDIT_CHAT_RETRY,
      retryForId: selectedChat.id,
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
      // setup a stream listener and its cleanup
      const streamCleanUp = await listen<string>("chat_stream", (stream) => {
        const text = stream.payload as string;
        if (!text) return;
        setMessages((prev: string[]) => [...prev, text]);
        fullText += text;
      });

      // trigger get_chat_completion
      await invoke("get_chat_completion", {
        base_url: activeModel.provider.baseURL,
        api_key: activeModel.provider.apiKey,
        model_id: activeModel.id,
        messages: prepareMessages({
          chats,
          system: activePrompt?.prompt ?? "",
          input: selectedChat.user,
        }),
      });

      // wait chat_complete and cleanup
      await once("chat_complete", () => {});
      streamCleanUp();
    } catch (_error) {
      await db.chat.delete(chatId);
    }

    // update chat when stream finish
    await db.chat.update(chatId, {
      assistant: fullText.replace(/<think>[\s\S]*?<\/think>/, ""),
      receivedAt: Date.now(),
    });
  };

  const onEditChat = (chat: Chat) => {
    setValue("input", chat.user);
    chatStore.setSelectedChat(chat.id);
  };

  const onEditChatSubmit = async (data: { input: string }) => {
    if (chatStore.selectedChatType !== ChatReplyTypeEnum.EDIT_CHAT) {
      return;
    }

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
      parentId: selectedChat.parentId,
      replyType: ChatReplyTypeEnum.EDIT_CHAT,
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
      // setup a stream listener and its cleanup
      const streamCleanUp = await listen<string>("chat_stream", (stream) => {
        const text = stream.payload as string;
        if (!text) return;
        setMessages((prev: string[]) => [...prev, text]);
        fullText += text;
      });

      // trigger get_chat_completion
      await invoke("get_chat_completion", {
        base_url: activeModel.provider.baseURL,
        api_key: activeModel.provider.apiKey,
        model_id: activeModel.id,
        messages: prepareMessages({
          chats,
          system: activePrompt?.prompt ?? "",
          input: data.input,
        }),
      });

      // wait chat_complete and cleanup
      await once("chat_complete", () => {});
      streamCleanUp();
    } catch (_error) {
      await db.chat.delete(chatId);
    }

    // update chat when stream finish
    await db.chat.update(chatId, {
      assistant: fullText.replace(/<think>[\s\S]*?<\/think>/, ""),
      receivedAt: Date.now(),
    });
  };

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

  const isEditing = (chatId: number) =>
    chatStore.selectedChatId === chatId &&
    chatStore.selectedChatType === ChatReplyTypeEnum.EDIT_CHAT;

  return chatsWithAlt.map((chat) => (
    <div className="elelem-chat" key={chat.id}>
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
          className={`chat-bubble markdown ${isEditing(chat.id) ? "w-full" : ""}`}
        >
          {isEditing(chat.id) ? (
            <form
              id={`chatUpdateForm_${chat.id}`}
              onSubmit={handleSubmit(onEditChatSubmit)}
            >
              <textarea
                className={`textarea max-h-none ${isEditing(chat.id) ? "w-full" : ""}`}
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
          {isEditing(chat.id) ? (
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
          ) : (
            <button className="cursor-pointer" onClick={() => onEditChat(chat)}>
              <IconEdit className="text-xs w-4 h-4" />
            </button>
          )}
          <CopyButton text={chat.user} />{" "}
          <div className="flex space-x-1">
            {!isEditing(chat.id) && (
              <AlternateChatSelector
                chat={chat}
                replyType={ChatReplyTypeEnum.EDIT_CHAT}
                alternates={chat.alt}
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
              <AlternateChatSelector
                chat={chat}
                alternates={chat.alt}
                replyType={ChatReplyTypeEnum.EDIT_CHAT_RETRY}
              />
            </div>
            <CopyButton text={chat.assistant} />
            <button className="cursor-pointer" onClick={() => onRetry(chat)}>
              <IconReload className="text-xs w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  ));
}

function AlternateChatSelector({
  chat,
  replyType,
  alternates,
}: {
  chat: ChatWithDetails;
  replyType: ChatReplyTypeEnum;
  alternates: ChatWithDetails[];
}) {
  const chatStore = useChatStore();
  const alts = getAltChat(chat, alternates, replyType);

  // find current index from searched chat id
  let findChat =
    alts.find((c) => c.id === chat.id) ??
    alts.find((c) => c.id === chat.retryForId);
  const currentId: number = findChat?.id ?? -1;
  const currentIndex = alts.findIndex((c) => c.id === currentId);

  const isPreviousAvailable = currentIndex > 0;
  const isNextAvailable = currentIndex < alts.length - 1;

  const onPrevious = () => {
    if (!isPreviousAvailable) return;

    // if the current chat has retry, select the latest retry
    let refId = alts.map((c) => c.id).at(currentIndex - 1);
    if (replyType === ChatReplyTypeEnum.EDIT_CHAT) {
      refId = alternates
        .filter((a) => a.id === refId || a.retryForId === refId)
        .at(-1)?.id;
    }

    chatStore.setSelectedChatRefId(refId);
  };

  const onNext = () => {
    if (!isNextAvailable) return;

    // if the current chat has retry, select the latest retry
    let refId = alts.map((c) => c.id).at(currentIndex + 1);
    if (replyType === ChatReplyTypeEnum.EDIT_CHAT) {
      refId = alternates
        .filter((a) => a.id === refId || a.retryForId === refId)
        .at(-1)?.id;
    }

    chatStore.setSelectedChatRefId(refId);
  };

  return (
    alts.length > 1 && (
      <>
        <button
          className="cursor-pointer disabled:text-gray-600"
          disabled={!isPreviousAvailable}
          onClick={onPrevious}
        >
          <IconChevronLeft className="text-xs w-4 h-4" />
        </button>
        <span>
          {currentIndex + 1} / {alts.length}
        </span>
        <button
          className="cursor-pointer disabled:text-gray-600"
          disabled={!isNextAvailable}
          onClick={onNext}
        >
          <IconChevronRight className="text-xs w-4 h-4" />
        </button>
      </>
    )
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
      <summary className="list-none px-4 flex items-center gap-1">
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
      <summary className="list-none px-4 flex items-center gap-1">
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
