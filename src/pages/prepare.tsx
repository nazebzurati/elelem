import useSettings from "@stores/settings";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import db from "../database/config";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    db.model.count().then((count) => {
      if (count <= 0) {
        navigation("/onboard");
      } else {
        settingsStore.setActiveConversation();
        navigation("/conversation");
      }
    });
  }, []);

  return <Loading />;
}
