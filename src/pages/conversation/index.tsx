import { getLatestConversation } from "@database/conversation";
import useSettingsStore from "@stores/settings";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import Chats from "./chat";
import Navbar from "./navbar";

function Conversation() {
  const settingsStore = useSettingsStore();

  const latestConversation = useLiveQuery(
    async () => await getLatestConversation(),
  );

  // shortcut controller
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "n") {
        // start new conversation
        e.preventDefault();
        settingsStore.setActiveConversation();
      } else if (e.ctrlKey && e.key === "l") {
        // load latest conversation
        e.preventDefault();
        settingsStore.setActiveConversation(latestConversation?.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [latestConversation]);

  return (
    <div className="h-svh flex flex-col overflow-hidden not-sm:pb-16">
      <Navbar />
      <Chats />
    </div>
  );
}

export default Conversation;
