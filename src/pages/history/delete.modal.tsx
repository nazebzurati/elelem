import db from "@database/config";
import useHistory from "@stores/history";
import useSettings from "@stores/settings";
import { IconX } from "@tabler/icons-react";
import { TIME_FORMAT } from "@utils/conversation";
import { toggleModal, UiToggleState } from "@utils/toggle";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";

export const DeleteConversationModalId = "deleteConversationModal";

export default function DeleteConversationModal() {
  const historyStore = useHistory();
  const settingsStore = useSettings();
  const selectedConversation = useLiveQuery(
    async () =>
      historyStore.selectedConversationId
        ? await db.conversation.get(historyStore.selectedConversationId)
        : undefined,
    [historyStore.selectedConversationId]
  );

  const onDelete = async () => {
    if (!selectedConversation) return;
    await db.conversation.delete(selectedConversation.id);

    if (settingsStore.activeConversationId === selectedConversation.id) {
      settingsStore.setActiveConversation(undefined);
    }

    toggleModal(DeleteConversationModalId, UiToggleState.CLOSE);
  };

  return (
    <dialog id={DeleteConversationModalId} className="modal">
      <div className="modal-box space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Delete Conversation</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          Are you absolutely sure that you wish to permanently delete the
          conversation from{" "}
          {dayjs(selectedConversation?.createdAt).format(TIME_FORMAT)}? This
          action cannot be reversed.
        </div>
        <div className="modal-action flex mt-3">
          <button
            type="button"
            onClick={onDelete}
            className="w-full btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
