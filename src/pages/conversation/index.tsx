import useSettings from "@stores/settings";
import Chats from "./chat";
import Navbar from "./navbar";
import { useEffect } from "react";
import { getLatestConversation } from "@database/conversation";
import { useLiveQuery } from "dexie-react-hooks";

function Conversation() {
  const settingsStore = useSettings();

  const latestConversation = useLiveQuery(
    async () => await getLatestConversation()
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
