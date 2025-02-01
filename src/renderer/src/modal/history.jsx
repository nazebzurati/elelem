import {
  IconChevronsLeft,
  IconChevronsRight,
  IconExternalLink,
  IconTrash,
  IconX
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/database';
import useSettings from '../store/settings';

export const HistoryModalId = 'historyModal';
const MAX_ITEM_PER_PAGE = 4;

export default function HistoryModal() {
  const conversationList = useLiveQuery(() => db.conversation.toArray());

  const onDelete = async (id) => {
    await db.chat.where({ conversationId: id }).delete();
    await db.conversation.delete(id);
    if (settingsStore.activeConversationId === id) {
      settingsStore.setActiveConversation(undefined);
    }
  };

  const settingsStore = useSettings();
  const onOpen = (conversationId, assistantId) => {
    settingsStore.setActiveAssistant(assistantId);
    settingsStore.setActiveConversation(conversationId);
  };

  const [page, setPage] = useState(1);
  const displayedList = useMemo(() => {
    const upperLimit = page * MAX_ITEM_PER_PAGE;
    const lowerLimit = (page - 1) * MAX_ITEM_PER_PAGE;
    return conversationList?.slice(lowerLimit, upperLimit);
  }, [page, conversationList]);

  useEffect(() => {
    if (displayedList?.length <= 0) {
      if (page > 1) setPage((state) => state - 1);
    }
    if (conversationList?.length > 0) return;
    document.getElementById(HistoryModalId).close();
  }, [conversationList, displayedList]);

  return (
    <dialog id={HistoryModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Conversation History</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <ul className="list">
          {displayedList?.map((conversation) => (
            <li key={conversation.id} className="list-row">
              <div>
                <div>{conversation.title ?? 'No title'}</div>
                <div className="text-xs uppercase font-semibold opacity-60">
                  {dayjs(conversation.createdAt).format('hh:mm:ss A, DD/MM/YYYY')}
                </div>
              </div>
              <div className="ms-auto">
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => onOpen(conversation.id, conversation.assistantId)}
                  disabled={settingsStore.activeConversationId === conversation.id}
                >
                  <IconExternalLink />
                </button>
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => onDelete(conversation.id)}
                >
                  <IconTrash className="text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {conversationList?.length > MAX_ITEM_PER_PAGE && (
          <div className="flex justify-center">
            <div className="join ">
              <button
                className="join-item btn btn-ghost"
                onClick={() => {
                  if (page <= 1) return;
                  setPage((state) => state - 1);
                }}
              >
                <IconChevronsLeft className="h-4 w-4" />
              </button>
              <button className="join-item btn btn-ghost">Page {page}</button>
              <button
                className="join-item btn btn-ghost"
                onClick={() => {
                  if (page >= Math.ceil(conversationList?.length / MAX_ITEM_PER_PAGE)) return;
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
