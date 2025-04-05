import db from "@lib/database";
import { Model } from "@lib/model.types";
import Loading from "@pages/loading";
import useSettings from "@store/settings";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import AboutModal from "./about";
import Chats from "./chat";
import HistoryModal from "./history";
import Navbar from "./navbar";
import SettingsModal from "./settings";

function Chat() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    (async () => {
      const modelList = await db.model.toArray();
      if (modelList.length > 0 && !settingsStore.activeModelId) {
        settingsStore.setActiveModel(modelList[0].id);
      }
    })();
  }, [settingsStore.activeModelId, navigation]);

  const modelList: Model[] | undefined = useLiveQuery(
    async () => await db.model.toArray()
  );
  useEffect(() => {
    if (!modelList) return;
    const shortcutTrigger = (event: KeyboardEvent) => {
      if (event.altKey) {
        const index = parseInt(event.key, 10) - 1;
        if (!isNaN(index) && index >= 0 && index < modelList.length) {
          settingsStore.setActiveModel(modelList[index].id);
        }
      }
    };
    addEventListener("keydown", shortcutTrigger);
    return () => {
      removeEventListener("keydown", shortcutTrigger);
    };
  }, [modelList, settingsStore]);

  if (!settingsStore.activeModelId) return <Loading />;
  return (
    <div className="h-svh flex flex-col overflow-hidden">
      <Navbar />
      <Chats />
      <SettingsModal />
      <HistoryModal />
      <AboutModal />
    </div>
  );
}

export default Chat;
