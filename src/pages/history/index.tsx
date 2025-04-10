import Drawer from "@components/drawer";
import { getConversationAll } from "@lib/model";
import useSettings from "@store/settings";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useNavigate } from "react-router";

export default function History() {
  const settingsStore = useSettings();
  const conversationList = useLiveQuery(async () => getConversationAll());

  const navigation = useNavigate();

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6">
          <Drawer />
        </div>
      </div>
      {/* title */}
      <div className="ps-7 pb-8 pt-2">
        <div className="text-xl font-bold">Conversation history</div>
        <p>Past conversations list.</p>
      </div>
      {/* items */}
      {conversationList && conversationList.length <= 0 && (
        <div className="px-7">No conversation history was found.</div>
      )}
      <div className="px-4 grid grid-cols-2 gap-2">
        {conversationList?.map((conversation) => (
          <div key={conversation.id} className="card card-border bg-base-200">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">
                {conversation.chats[0].user}
              </h2>
              <p className="-mt-2 line-clamp-1">
                {conversation.chats[0].modelId}
              </p>
              <p className="text-xs -mt-2 line-clamp-1">
                {dayjs(conversation.createdAt).format("DD/MM/YYYY, hh:mm:ss A")}
              </p>
              <div className="card-actions justify-end mt-2">
                <button
                  className="btn"
                  onClick={() => {
                    settingsStore.setActiveConversation(conversation.id);
                    navigation("/chat");
                  }}
                >
                  Open
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
