import db from "@lib/database";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();

  useEffect(() => {
    db.model.toArray().then((models) => {
      if (models.length > 0) {
        navigation("/chat");
      } else {
        navigation("/onboard");
      }
    });
  }, []);

  return <Loading />;
}
