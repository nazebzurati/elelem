import {
  IconEdit,
  IconHistory,
  IconInfoCircle,
  IconMessageCirclePlus,
  IconPlus,
  IconSettings,
} from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useMemo, useRef } from "react";
import db from "@lib/database";
import { AboutModalId } from "./about";
import { AddAssistantModalId } from "./add";
import { HistoryModalId } from "./history";
import { SettingsModalId } from "./settings";
import { UpdateAssistantModalId } from "./update";
import useSettings from "@store/settings";
import { Assistant, AssistantListing } from "@lib/model.types";

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

  return (
    <ul className="menu menu-horizontal inline-block">
      <li>
        <details>
          <summary ref={menuRef}>
            <div>
              <div className="line-clamp-1">{activeAssistant?.name}</div>
              <span className="line-clamp-1 text-xs">
                {activeAssistant?.modelId}
              </span>
            </div>
          </summary>
          <ul className="bg-base-200 rounded-t-none p-2 z-300 w-max mt-1!">
            {assistants?.map((assistant) => (
              <li key={assistant.id}>
                <button
                  type="button"
                  className={
                    assistant.id === activeAssistant?.id ? "bg-primary" : ""
                  }
                  onClick={() => onSelect(assistant.id)}
                >
                  <div className="kbd kbd-sm me-2">ALT + {assistant.index}</div>{" "}
                  <div className="flex flex-col">
                    {assistant.name}
                    <span className="text-xs">{assistant.modelId}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </li>
    </ul>
  );
}
