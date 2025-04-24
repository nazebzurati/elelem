import { getPromptList } from "@database/prompt";
import usePrompt from "@stores/prompt";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { useLiveQuery } from "dexie-react-hooks";
import AddPromptModal from "./add.modal";
import DeletePromptModal, { DeletePromptModalId } from "./delete.modal";
import Navbar from "./navbar";
import UpdatePromptModal, { UpdatePromptModalId } from "./update.modal";

export default function Prompt() {
  const promptStore = usePrompt();
  const promptList = useLiveQuery(async () => await getPromptList());

  return (
    <div>
      {/* navbar */}
      <Navbar />
      {/* items */}
      <div className="p-4 flex justify-center">
        <ul className="list bg-base-200 rounded-box w-xl">
          {promptList && promptList.length <= 0 && (
            <li className="list-row flex text-center">
              <p className="w-full">No prompt was found.</p>
            </li>
          )}
          {promptList?.map((prompt) => (
            <li className="list-row flex">
              <div className="flex-1">
                <div className="font-bold">{prompt.title}</div>
                <div className="text-xs opacity-60">{prompt.prompt}</div>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    promptStore.setSelectedPrompt(prompt.id);
                    toggleModal(UpdatePromptModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconEdit className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    promptStore.setSelectedPrompt(prompt.id);
                    toggleModal(DeletePromptModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconTrash className="w-6 h-6 text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* modal */}
      <AddPromptModal />
      <DeletePromptModal />
      <UpdatePromptModal />
    </div>
  );
}
