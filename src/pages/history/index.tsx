import { TIME_FORMAT } from "@utils/conversation";
import useHistory from "@stores/history";
import useSettings from "@stores/settings";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router-dom";
import DeleteConversationModal, {
  DeleteConversationModalId,
} from "./delete.modal";
import { getConversationList } from "@database/conversation";
import { toggleModal, UiToggleState } from "@utils/toggle";

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
      {/* items */}
      {conversationList && conversationList.length <= 0 && (
        <div className="px-7 py-4">No conversation history was found.</div>
      )}
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {conversationList?.map((conversation) => (
          <div key={conversation.id} className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">
                {conversation.chats?.[0].user ?? "n/a"}
              </h2>
              <p className="text-sm -mt-2 line-clamp-1">
                {dayjs(conversation.createdAt).format(TIME_FORMAT)}
              </p>
              <div className="card-actions justify-end mt-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    settingsStore.setActiveConversation(conversation.id);
                    navigation("/conversation");
                  }}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={() => {
                    historyStore.setSelectedConversation(conversation.id);
                    toggleModal(DeleteConversationModalId, UiToggleState.OPEN);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* modals */}
      <DeleteConversationModal />
    </div>
  );
}
