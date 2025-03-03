import db from "@lib/database";
import { Assistant, AssistantListing } from "@lib/model.types";
import useSettings from "@store/settings";
import {
  IconChevronDown,
  IconEdit,
  IconHistory,
  IconInfoCircle,
  IconMessageCirclePlus,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useRef } from "react";
import { AboutModalId } from "./about";
import { AddAssistantModalId } from "./add";
import { HistoryModalId } from "./history";
import { SettingsModalId } from "./settings";
import { UpdateAssistantModalId } from "./update";

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
        <div className="tooltip tooltip-bottom" data-tip="Add Assistant">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => openModal(AddAssistantModalId)}
          >
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Update Assistant">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => openModal(UpdateAssistantModalId)}
          >
            <IconEdit className="h-6 w-6" />
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
  const assistants: AssistantListing[] | undefined = useLiveQuery(async () =>
    (await db.assistant.toArray()).map((a: Assistant, i: number) => ({
      ...a,
      index: i + 1,
    }))
  );

  const activeAssistant = useMemo(() => {
    return assistants?.find((a) => a.id === settingsStore.activeAssistantId);
  }, [assistants, settingsStore.activeAssistantId]);

  const menuRef = useRef<HTMLDetailsElement>(null);
  const onSelect = (assistantId: number) => {
    settingsStore.setActiveAssistant(assistantId);
    setTimeout(() => {
      menuRef.current?.click();
    }, MENU_CLOSING_DELAY_MS);
  };

  const checkIfActive = (id: number) => {
    return id === activeAssistant?.id ? "bg-primary" : "";
  };

  return (
    <div className="dropdown">
      <div tabIndex={0} role="button" className="m-1 flex items-center">
        <div className="kbd kbd-sm me-3">ALT + {activeAssistant?.index}</div>
        <div className="flex flex-col me-3">
          {activeAssistant?.name}
          <span className="text-xs">{activeAssistant?.modelId}</span>
        </div>
        <IconChevronDown className="w-4 h-4" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 w-max shadow-sm"
      >
        {assistants?.map((assistant) => (
          <li key={assistant.id}>
            <button
              type="button"
              onClick={() => onSelect(assistant.id)}
              className={`flex items-center ${checkIfActive(assistant.id)}`}
            >
              <div className="kbd kbd-sm me-1">ALT + {assistant.index}</div>
              <div className="flex flex-col">
                {assistant.name}
                <span className="text-xs">{assistant.modelId}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
