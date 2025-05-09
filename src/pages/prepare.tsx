import db from "../database/config";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "./loading";

export default function Prepare() {
  const navigation = useNavigate();

  useEffect(() => {
    db.model.count().then((count) => {
      count > 0 ? navigation("/conversation") : navigation("/onboard");
    });
  }, []);

  return <Loading />;
}
