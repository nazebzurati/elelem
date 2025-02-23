import db from "@lib/database";
import { AssistantListing } from "@lib/model.types";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useSettings from "@store/settings";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";

export const DeleteAssistantModalId = "deleteAssistantModal";

export default function DeleteAssistantModal() {
  const assistants: AssistantListing[] | undefined = useLiveQuery(async () =>
    (await db.assistant.toArray()).map((a, i) => ({ ...a, index: i + 1 }))
  );

  const settingsStore = useSettings();
  const activeAssistant: AssistantListing | undefined = useMemo(
    () => assistants?.find((a) => a.id === settingsStore.activeAssistantId),
    [assistants, settingsStore.activeAssistantId]
  );

  const onDelete = async () => {
    if (!activeAssistant || !assistants) return;
    try {
      settingsStore.setActiveAssistant(undefined);
      const remainingAssistants = assistants?.filter(
        (a) => a.id != activeAssistant?.id
      );
      await db.assistant.where({ id: activeAssistant.id }).delete();
      if (remainingAssistants.length > 0) {
        settingsStore.setActiveAssistant(remainingAssistants[0].id);
      }
      toggleModal(DeleteAssistantModalId, ModalState.CLOSE);
    } catch (_error) {
      return;
    }
  };

  return (
    <dialog id={DeleteAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="text-center mb-6">
          <h3 className="font-bold text-lg">
            Delete '{activeAssistant?.name}'?
          </h3>
        </div>
        <div>
          <div>
            <p>
              Just a heads up - once you say goodbye, they'll be gone for good
              and <kbd className="kbd">ALT</kbd>
              <kbd className="kbd">{activeAssistant?.index}</kbd> shortcut will
              be reassigned!
            </p>
          </div>
          <div className="modal-action flex">
            <form method="dialog" className="flex-1">
              <button type="submit" className="w-full btn btn-neutral">
                Cancel
              </button>
            </form>
            <div className="flex-1">
              <button
                type="button"
                onClick={onDelete}
                className="w-full btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
