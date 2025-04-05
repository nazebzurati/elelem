import db from "@lib/database";
import { Model } from "@lib/model.types";
import useSettings from "@store/settings";
import { IconChevronDown } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useRef } from "react";
import Drawer from "./drawer";

const MENU_CLOSING_DELAY_MS = 100;

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 flex-none px-6 flex">
      <div className="navbar-start me-6 flex-0">
        <Drawer />
      </div>
      <div className="navbar-end flex-1">
        <ModelSelector />
      </div>
    </div>
  );
}

function ModelSelector() {
  const settingsStore = useSettings();
  const models: Model[] | undefined = useLiveQuery(async () =>
    db.model.toArray()
  );

  const activeModel = useMemo(() => {
    return models?.find((m) => m.id === settingsStore.activeModelId);
  }, [models, settingsStore.activeModelId]);

  const menuRef = useRef<HTMLDetailsElement>(null);
  const onSelect = (modelId: string) => {
    settingsStore.setActiveModel(modelId);
    setTimeout(() => {
      menuRef.current?.click();
    }, MENU_CLOSING_DELAY_MS);
  };

  const checkIfActive = (id: string) => {
    return id === activeModel?.id ? "bg-primary" : "";
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="m-1 flex items-center">
        <div className="flex flex-col me-3">{activeModel?.id}</div>
        <IconChevronDown className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 w-max shadow-sm"
      >
        {models?.map((model) => (
          <li key={model.id}>
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className={`flex items-center ${checkIfActive(model.id)}`}
            >
              <div className="flex flex-col">{model.id}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
