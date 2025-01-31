import { IconExternalLink, IconTrash, IconX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/database';
import useSettings from '../store/settings';

export const HistoryModalId = 'historyModal';

export default function HistoryModal() {
  const conversationList = useLiveQuery(() => db.conversation.toArray());

  const onDelete = async (id) => {
    await db.chat.where({ conversationId: id }).delete();
    await db.conversation.delete(id);
  };

  const settingsStore = useSettings();
  const onOpen = (conversationId, assistantId) => {
    settingsStore.setActiveAssistant(assistantId);
    settingsStore.setActiveConversation(conversationId);
  };

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
          {conversationList?.slice(0, 5).map((conversation) => (
            <li key={conversation.id} className="list-row">
              <div>
                <div>{conversation.name}</div>
                <div className="text-xs uppercase font-semibold opacity-60">ABC</div>
              </div>
              <div className="ms-auto">
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    onOpen(conversation.id, conversation.assistantId);
                  }}
                >
                  <IconExternalLink />
                </button>
                <button
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    onDelete(conversation.id);
                  }}
                >
                  <IconTrash className="text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
