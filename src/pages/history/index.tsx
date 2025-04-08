import { getConversationAll } from "@lib/model";
import Drawer from "@components/drawer";
import { useLiveQuery } from "dexie-react-hooks";

export default function History() {
  const conversationList = useLiveQuery(async () => getConversationAll());

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6 flex-0">
          <Drawer />
        </div>
      </div>
      {/* title */}
      <div className="ps-7 pb-8 pt-2">
        <div className="text-xl font-bold">Conversation history</div>
        <p className="text-sm">Past conversations list.</p>
      </div>
      {/* items */}
      {conversationList && conversationList.length <= 0 && (
        <div className="px-4">No conversation history was found.</div>
      )}
      <div className="px-4 grid grid-cols-3 gap-2">
        {conversationList?.map((conversation) => (
          <div className="card card-border bg-base-200">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{conversation.id}</h2>
              <p className="text-sm -mt-2 line-clamp-1">
                {conversation.chats[0].modelId}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
