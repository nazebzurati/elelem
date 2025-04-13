import db from "@lib/database";
import { IconChevronDown } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef } from "react";
import Drawer from "../../components/drawer";

const MENU_CLOSING_DELAY_MS = 100;

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 flex-none px-6 flex">
      <div className="flex-none me-2">
        <Drawer />
      </div>
      <div className="flex-1">
        <h1 className="btn btn-ghost text-xl">Conversation</h1>
      </div>
      <ModelSelector />
    </div>
  );
}

function ModelSelector() {
  const modelList = useLiveQuery(async () => await db.model.toArray());
  const activeModel = modelList?.find((model) => model.isActive);

  const menuRef = useRef<HTMLDetailsElement>(null);
  const onSelect = async (modelId: string) => {
    const activeModels = await db.model.where({ isActive: 1 }).toArray();
    await db.model.bulkUpdate(
      activeModels.map((model) => ({
        key: model.id,
        changes: { isActive: 0 },
      }))
    );
    await db.model.update(modelId, { isActive: 1 });
    setTimeout(() => {
      menuRef.current?.click();
    }, MENU_CLOSING_DELAY_MS);
  };

  return (
    <div className="dropdown dropdown-end">
      <button type="button" className="m-1 flex items-center">
        <div className="flex flex-col font-bold me-3 line-clamp-1!">
          {activeModel?.id ?? "No model selected"}
        </div>
        <IconChevronDown className="w-4 h-4" />
      </button>
      <div className="dropdown-content max-h-60 overflow-y-auto w-max">
        <ul className="menu bg-base-200 rounded-box">
          {modelList?.map((model) => (
            <li key={model.id}>
              <button
                type="button"
                onClick={() => onSelect(model.id)}
                className={`flex items-center ${
                  model.isActive ? "text-primary font-bold" : ""
                }`}
              >
                <div className="flex flex-col">{model.id}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
