import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import usePrompt from "@store/prompt";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";

export const DeletePromptModalId = "deletePromptModal";

export default function DeletePromptModal() {
  const promptStore = usePrompt();
  const selectedPrompt = useLiveQuery(
    async () =>
      promptStore.selectedPromptId
        ? await db.prompt.get(promptStore.selectedPromptId)
        : undefined,
    [promptStore],
  );

  const onDelete = async () => {
    if (!selectedPrompt) return;
    await db.prompt.delete(selectedPrompt.id);
    toggleModal(DeletePromptModalId, ModalState.CLOSE);
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
          Before we delete ‘{selectedPrompt?.title}’, we just want to make sure
          you’re certain. This change can’t be undone, so if you’re ready, we’ll
          go ahead and remove it.
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
        <button>close</button>
      </form>
    </dialog>
  );
}
