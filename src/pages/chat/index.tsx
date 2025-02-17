import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Chats from "./chat";
import Navbar from "./navbar";
import db from "@lib/database";
import AboutModal from "./about";
import AddAssistantModal from "./add";
import DeleteAssistantModal from "./delete";
import HistoryModal from "./history";
import SettingsModal from "./settings";
import UpdateAssistantModal from "./update";
import useSettings from "@store/settings";
import Loading from "@pages/loading";
import { Assistant } from "@lib/model.types";

function Chat() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    (async () => {
      const assistants = await db.assistant.toArray();
      if (assistants.length <= 0) {
        settingsStore.resetOnboardingFlag();
        navigation("/onboard");
      } else if (assistants.length > 0 && !settingsStore.activeAssistantId) {
        settingsStore.setActiveAssistant(assistants[0].id);
      }
    })();
  }, [settingsStore.activeAssistantId, navigation]);

  const assistants: Assistant[] | undefined = useLiveQuery(
    async () => await db.assistant.toArray()
  );
  useEffect(() => {
    if (!assistants) return;
    const shortcutTrigger = (event: KeyboardEvent) => {
      if (event.altKey) {
        const index = parseInt(event.key, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < assistants.length) {
          settingsStore.setActiveAssistant(assistants[index].id);
        }
      }
    };
    addEventListener("keydown", shortcutTrigger);
    return () => {
      removeEventListener("keydown", shortcutTrigger);
    };
  }, [assistants, settingsStore]);

  if (!settingsStore.activeAssistantId) return <Loading />;
  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Navbar />
      <Chats />
      <SettingsModal />
      <AddAssistantModal />
      <UpdateAssistantModal />
      <DeleteAssistantModal />
      <HistoryModal />
      <AboutModal />
    </div>
  );
}

export default Chat;
