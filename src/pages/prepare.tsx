import db from "../database/config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";
import useSettings from "@stores/settings";

export default function Prepare() {
  const navigation = useNavigate();
  const settingsStore = useSettings();

  useEffect(() => {
    db.model.count().then((count) => {
      if (count <= 0) navigation("/onboard");
      settingsStore.setActiveConversation();
      navigation("/conversation");
    });
  }, []);

  return <Loading />;
}
