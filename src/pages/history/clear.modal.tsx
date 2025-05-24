import db from "@database/config";
import useSettings from "@stores/settings";
import { IconX } from "@tabler/icons-react";
import { toggleModal, UiToggleState } from "@utils/toggle";

export const ClearConversationModalId = "clearConversationModal";

export default function ClearConversationModal() {
  const settingsStore = useSettings();

  const onClear = async () => {
    await db.conversation.clear();
    settingsStore.setActiveConversation();

    toggleModal(ClearConversationModalId, UiToggleState.CLOSE);
  };

  return (
    <dialog id={ClearConversationModalId} className="modal">
      <div className="modal-box space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Clear History</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          Are you absolutely sure that you wish to permanently clear your
          conversation history? This action cannot be reversed.
        </div>
        <div className="modal-action flex mt-3">
          <button
            type="button"
            onClick={onClear}
            className="w-full btn btn-error"
          >
            Clear
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
