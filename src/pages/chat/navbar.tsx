import db from "@lib/database";
import { IconChevronDown } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useRef } from "react";
import Drawer from "../../components/drawer";

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
  const modelList = useLiveQuery(async () => await db.model.toArray());
  const activeModel = modelList?.find((model) => model.isActive);

  const menuRef = useRef<HTMLDetailsElement>(null);
  const onSelect = async (modelId: string) => {
    const activeModels = await db.model.where({ isActive: 1 }).toArray();
    await db.model.bulkUpdate(
      activeModels.map((model) => ({
        key: model.id,
        changes: { isActive: 0 },
      })),
    );
    await db.model.update(modelId, { isActive: 1 });
    setTimeout(() => {
      menuRef.current?.click();
    }, MENU_CLOSING_DELAY_MS);
  };

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="m-1 flex items-center">
        <div className="flex flex-col me-3">{activeModel?.id}</div>
        <IconChevronDown className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu menu-horizontal line-clamp-1 bg-base-200 w-max rounded-box z-1 shadow-sm overflow-y-auto max-h-60"
      >
        {modelList?.map((model) => (
          <li key={model.id}>
            <button
              type="button"
              onClick={() => onSelect(model.id)}
              className={`flex items-center ${
                model.isActive ? "text-primary" : ""
              }`}
            >
              <div className="flex flex-col">{model.id}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
