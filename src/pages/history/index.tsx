import { getConversationList } from "@database/conversation";
import useHistory from "@stores/history";
import useSettings from "@stores/settings";
import { IconExternalLink, IconTrash } from "@tabler/icons-react";
import { TIME_FORMAT } from "@utils/conversation";
import { toggleModal, UiToggleState } from "@utils/toggle";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import DeleteConversationModal, {
  DeleteConversationModalId,
} from "./delete.modal";
import Navbar from "./navbar";
import ClearConversationModal from "./clear.modal";

export default function History() {
  const historyStore = useHistory();
  const settingsStore = useSettings();
  const conversationList = useLiveQuery(
    async () => await getConversationList()
  );

  const navigation = useNavigate();

  return (
    <div>
      {/* navbar */}
      <Navbar />
      {/* items */}
      <div className="p-4 flex justify-center">
        <ul className="list bg-base-200 rounded-box w-xl">
          {conversationList && conversationList.length <= 0 && (
            <li className="list-row flex text-center">
              <p className="w-full">No conversation was found.</p>
            </li>
          )}
          {conversationList?.map((conversation) => (
            <li key={conversation.id} className="list-row flex">
              <div className="flex-1">
                <div
                  className={`text-base font-bold line-clamp-1 ${
                    conversation.id === settingsStore.activeConversationId
                      ? "text-primary"
                      : ""
                  }`}
                >
                  {conversation.chats?.[0].user ?? "n/a"}
                </div>
                <div className="text-sm opacity-60">
                  Created at {dayjs(conversation.createdAt).format(TIME_FORMAT)}
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    settingsStore.setActiveConversation(conversation.id);
                    navigation("/conversation");
                  }}
                >
                  <IconExternalLink className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    historyStore.setSelectedConversation(conversation.id);
                    toggleModal(DeleteConversationModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconTrash className="w-6 h-6 text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* modals */}
      <DeleteConversationModal />
      <ClearConversationModal />
    </div>
  );
}
