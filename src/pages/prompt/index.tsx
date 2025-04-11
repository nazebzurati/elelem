import Drawer from "@components/drawer";
import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { UiToggleState } from "@lib/utils.types";
import usePrompt from "@store/prompt";
import { IconPlus } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import AddPromptModal, { AddPromptModalId } from "./add.modal";
import DeletePromptModal, { DeletePromptModalId } from "./delete.modal";
import UpdatePromptModal, { UpdatePromptModalId } from "./update.modal";

export default function Prompt() {
  const promptStore = usePrompt();
  const promptList = useLiveQuery(async () => await db.prompt.toArray());

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex sticky top-0 z-10">
        <div className="flex-none me-2">
          <Drawer />
        </div>
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Prompt List</a>
        </div>
        <div className="flex-none">
          <div className="tooltip tooltip-bottom" data-tip="Add prompt">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={() => toggleModal(AddPromptModalId, UiToggleState.OPEN)}
            >
              <IconPlus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* items */}
      {promptList && promptList.length <= 0 && (
        <div className="px-7 py-4">No prompt was found.</div>
      )}
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {promptList?.map((prompt) => (
          <div key={prompt.id} className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{prompt.title}</h2>
              <p className="text-sm -mt-2 line-clamp-1">{prompt.prompt}</p>
              <div className="card-actions justify-end mt-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    promptStore.setSelectedPrompt(prompt.id);
                    toggleModal(UpdatePromptModalId, UiToggleState.OPEN);
                  }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    promptStore.setSelectedPrompt(prompt.id);
                    toggleModal(DeletePromptModalId, UiToggleState.OPEN);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* modal */}
      <AddPromptModal />
      <DeletePromptModal />
      <UpdatePromptModal />
    </div>
  );
}
