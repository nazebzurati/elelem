import { TIME_FORMAT } from "@lib/chat";
import db from "@lib/database";
import { getConversationHistory } from "@lib/model";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useSettings from "@store/settings";
import {
  IconChevronsLeft,
  IconChevronsRight,
  IconExternalLink,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";

export const HistoryModalId = "historyModal";
const MAX_ITEM_PER_PAGE = 4;

export default function HistoryModal() {
  const conversationList = useLiveQuery(
    async () => await getConversationHistory()
  );
  const settingsStore = useSettings();

  const onDelete = async (conversationId: number) => {
    await db.chat.where({ conversationId }).delete();
    await db.conversation.delete(conversationId);
    if (settingsStore.activeConversationId === conversationId) {
      settingsStore.setActiveConversation(undefined);
    }
  };

  const onOpen = (conversationId: number, assistantId: number) => {
    settingsStore.setActiveAssistant(assistantId);
    settingsStore.setActiveConversation(conversationId);
    toggleModal(HistoryModalId, ModalState.CLOSE);
  };

  const [page, setPage] = useState(1);
  const displayedList = useMemo(() => {
    const upperLimit = page * MAX_ITEM_PER_PAGE;
    const lowerLimit = (page - 1) * MAX_ITEM_PER_PAGE;
    return conversationList?.slice(lowerLimit, upperLimit);
  }, [page, conversationList]);

  useEffect(() => {
    if (displayedList && displayedList.length <= 0) {
      if (page > 1) setPage((state) => state - 1);
      toggleModal(HistoryModalId, ModalState.CLOSE);
    }
  }, [conversationList, displayedList]);

  if (!conversationList || !displayedList) return null;
  return (
    <dialog id={HistoryModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Conversation History</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <ul className="list">
          {displayedList.map((conversation) => (
            <li
              key={conversation.id}
              className="list-row flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="line-clamp-1">
                  {conversation.title ?? "No title"}
                </div>
                <div className="line-clamp-1 text-xs font-semibold opacity-60">
                  {conversation.assistant?.name},{" "}
                  {dayjs(conversation.firstChat?.receivedAt).format(
                    TIME_FORMAT
                  )}
                </div>
              </div>
              <div className="w-max ml-auto flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() =>
                    onOpen(conversation.id, conversation.assistantId)
                  }
                  disabled={
                    settingsStore.activeConversationId === conversation.id
                  }
                >
                  <IconExternalLink />
                </button>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => onDelete(conversation.id)}
                >
                  <IconTrash className="text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {conversationList.length > MAX_ITEM_PER_PAGE && (
          <div className="flex justify-center">
            <div className="join ">
              <button
                type="button"
                className="join-item btn btn-ghost"
                onClick={() => {
                  if (page <= 1) return;
                  setPage((state) => state - 1);
                }}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </button>
              <button type="button" className="join-item btn btn-ghost">
                Page {page}
              </button>
              <button
                type="button"
                className="join-item btn btn-ghost"
                onClick={() => {
                  if (
                    page >=
                    Math.ceil(conversationList.length / MAX_ITEM_PER_PAGE)
                  )
                    return;
                  setPage((state) => state + 1);
                }}
              >
                <IconChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
