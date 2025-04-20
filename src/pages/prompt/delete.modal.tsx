import db from "@database/config";
import { toggleModal, UiToggleState } from "@utils/toggle";
import usePrompt from "@stores/prompt";
import useSettings from "@stores/settings";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";

export const DeletePromptModalId = "deletePromptModal";

export default function DeletePromptModal() {
  const settingsStore = useSettings();
  const promptStore = usePrompt();
  const selectedPrompt = useLiveQuery(
    async () =>
      promptStore.selectedPromptId
        ? await db.prompt.get(promptStore.selectedPromptId)
        : undefined,
    [promptStore]
  );

  const onDelete = async () => {
    if (!selectedPrompt) return;
    await db.prompt.delete(selectedPrompt.id);

    promptStore.setSelectedPrompt(undefined);
    if (promptStore.selectedPromptId === settingsStore.activePromptId) {
      settingsStore.setActivePrompt(undefined);
    }

    toggleModal(DeletePromptModalId, UiToggleState.CLOSE);
  };

  return (
    <dialog id={DeletePromptModalId} className="modal">
      <div className="modal-box space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Delete Prompt</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          Deleting '{selectedPrompt?.title}' prompt doesn't remove chat created
          using the prompt; just no longer displayed using any prompt.
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
