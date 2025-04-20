import db from "@database/config";
import usePrompt from "@stores/prompt";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { useLiveQuery } from "dexie-react-hooks";
import AddPromptModal from "./add.modal";
import DeletePromptModal, { DeletePromptModalId } from "./delete.modal";
import Navbar from "./navbar";
import UpdatePromptModal, { UpdatePromptModalId } from "./update.modal";

export default function Prompt() {
  const promptStore = usePrompt();
  const promptList = useLiveQuery(async () => await db.prompt.toArray());

  return (
    <div>
      {/* navbar */}
      <Navbar />
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
                  className="btn btn-primary"
                  onClick={() => {
                    promptStore.setSelectedPrompt(prompt.id);
                    toggleModal(UpdatePromptModalId, UiToggleState.OPEN);
                  }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-error"
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
