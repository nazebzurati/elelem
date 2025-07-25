import useChatStore from "@stores/chat";
import useSettingsStore from "@stores/settings";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import db from "../database/config";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();
  const chatStore = useChatStore();
  const settingsStore = useSettingsStore();

  useEffect(() => {
    db.model.count().then((count) => {
      if (count <= 0) {
        navigation("/onboard");
      } else {
        chatStore.setSelectedChat();
        chatStore.setSelectedChatRefId();
        settingsStore.setActiveConversation();
        navigation("/conversation");
      }
    });
  }, []);

  return <Loading />;
}
