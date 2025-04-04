import db from "@lib/database";
import useSettings from "@store/settings";
import {
  IconChevronDown,
  IconHistory,
  IconInfoCircle,
  IconMessageCirclePlus,
  IconSettings,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useRef } from "react";
import { AboutModalId } from "./about";
import { HistoryModalId } from "./history";
import { SettingsModalId } from "./settings";
import { Model } from "@lib/model.types";

const MENU_CLOSING_DELAY_MS = 100;

export default function Navbar() {
  const conversationList = useLiveQuery(() => db.conversation.toArray());
  const settingsStore = useSettings();

  const openModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  return (
    <div className="navbar bg-base-100 flex-none">
      <div className="navbar-start me-6">
        <AssistantSelector />
      </div>
      <div className="navbar-end">
        <div className="tooltip tooltip-bottom" data-tip="New conversation">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            disabled={!settingsStore.activeConversationId}
            onClick={() => {
              if (settingsStore.activeConversationId) {
                settingsStore.setActiveConversation(undefined);
              }
            }}
          >
            <IconMessageCirclePlus className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="History">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            disabled={(conversationList?.length ?? 0) <= 0}
            onClick={() => {
              if ((conversationList?.length ?? 0) > 0) {
                openModal(HistoryModalId);
              }
            }}
          >
            <IconHistory className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => openModal(SettingsModalId)}
          >
            <IconSettings className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="About">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => openModal(AboutModalId)}
          >
            <IconInfoCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssistantSelector() {
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
    <div className="dropdown">
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
