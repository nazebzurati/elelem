import db from "@lib/database";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();

  useEffect(() => {
    db.model.count().then((count) => {
      count > 0 ? navigation("/chat") : navigation("/onboard");
    });
  }, []);

  return <Loading />;
}
