import { IconEdit, IconHistory, IconInfoCircle, IconPlus, IconSettings } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useRef } from 'react';
import { db } from '../lib/database';
import { AboutModalId } from '../modal/about';
import { AddAssistantModalId } from '../modal/add';
import { HistoryModalId } from '../modal/history';
import { SettingsModalId } from '../modal/settings';
import { UpdateAssistantModalId } from '../modal/update';
import useSettings from '../store/settings';

const MENU_CLOSING_DELAY_MS = 100;

export default function Navbar() {
  const openModal = (id) => {
    document.getElementById(id).showModal();
  };

  return (
    <div className="navbar bg-base-100 flex-none">
      <div className="flex-1">
        <AssistantSelector />
      </div>
      <div className="navbar-end">
        <div
          className="tooltip tooltip-bottom"
          data-tip="History"
          onClick={() => openModal(HistoryModalId)}
        >
          <button className="btn btn-ghost btn-circle">
            <IconHistory className="h-6 w-6" />
          </button>
        </div>
        <div
          className="tooltip tooltip-bottom"
          data-tip="Add Assistant"
          onClick={() => openModal(AddAssistantModalId)}
        >
          <button className="btn btn-ghost btn-circle">
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
        <div
          className="tooltip tooltip-bottom"
          data-tip="Update Assistant"
          onClick={() => openModal(UpdateAssistantModalId)}
        >
          <button className="btn btn-ghost btn-circle">
            <IconEdit className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className="btn btn-ghost btn-circle" onClick={() => openModal(SettingsModalId)}>
            <IconSettings className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="About">
          <button className="btn btn-ghost btn-circle" onClick={() => openModal(AboutModalId)}>
            <IconInfoCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AssistantSelector() {
  const settingsStore = useSettings();
  const assistants = useLiveQuery(async () =>
    (await db.assistant.toArray()).map((a, i) => ({ ...a, index: i + 1 }))
  );

  const activeAssistant = useMemo(() => {
    return assistants?.find((a) => a.id === settingsStore.activeAssistantId);
  }, [assistants, settingsStore.activeAssistantId]);

  const menuRef = useRef(null);
  const onSelect = (assistantId) => {
    settingsStore.setActiveAssistant(assistantId);
    setTimeout(() => {
      menuRef.current.click();
    }, MENU_CLOSING_DELAY_MS);
  };

  return (
    <ul className="menu menu-horizontal px-1">
      <li>
        <details>
          <summary ref={menuRef}>
            <div className="flex flex-col me-4">
              {activeAssistant?.name}
              <span className="text-xs">{activeAssistant?.modelId}</span>
            </div>
          </summary>
          <ul className="bg-base-200 rounded-t-none p-2 z-300 w-max mt-1!">
            {assistants?.length <= 0 ? (
              <li>
                <a>No other assistant found.</a>
              </li>
            ) : (
              assistants?.map((assistant) => (
                <li key={assistant.id}>
                  <a
                    className={assistant.id === activeAssistant?.id ? 'bg-primary' : ''}
                    onClick={() => onSelect(assistant.id)}
                  >
                    <div>
                      <kbd className="kbd">ALT</kbd>
                      <kbd className="kbd">{assistant.index}</kbd>
                    </div>{' '}
                    <div className="flex flex-col">
                      {assistant.name}
                      <span className="text-xs">{assistant.modelId}</span>
                    </div>
                  </a>
                </li>
              ))
            )}
          </ul>
        </details>
      </li>
    </ul>
  );
}
