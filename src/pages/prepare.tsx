import db from "@lib/database";
import useSettings from "@store/settings";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    db.assistant.toArray().then((assistants) => {
      if (assistants.length > 0) {
        settingsStore.setActiveAssistant(assistants[0].id);
        navigation("/chat");
      } else {
        settingsStore.resetOnboardingFlag();
        navigation("/onboard");
      }
    });
  }, []);

  return <Loading />;
}
