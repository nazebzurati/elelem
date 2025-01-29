import { IconEdit, IconHistory, IconPlus, IconSettings } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo } from 'react';
import { db } from '../lib/database';
import { AddAssistantModalId } from '../modal/add';
import { HistoryModalId } from '../modal/history';
import { SettingsModalId } from '../modal/settings';
import { UpdateAssistantModalId } from '../modal/update';
import useSettings from '../store/settings';

export default function Navbar() {
  const openModal = (id) => {
    document.getElementById(id).showModal();
  };

  const settings = useSettings();
  const assistants = useLiveQuery(async () => await db.assistant.toArray());
  useEffect(() => {
    if (!settings.activeAssistantId && assistants && assistants.length > 0) {
      settings.setActiveAssistant(assistants[0].id);
    }
  }, [assistants]);

  const activeAssistant = useMemo(
    () => assistants?.find((a) => a.id === settings.activeAssistantId),
    [assistants, settings.activeAssistantId]
  );

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>
                <div>
                  <kbd className="kbd kbd-sm">CTRL</kbd>+<kbd className="kbd kbd-sm">1</kbd>
                </div>{' '}
                {activeAssistant?.name ?? 'n/a'}
              </summary>
              <ul className="bg-base-200 rounded-t-none p-2 z-300 w-max">
                <li>
                  <a>ABC</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
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
        <div
          className="tooltip tooltip-bottom"
          data-tip="History"
          onClick={() => openModal(HistoryModalId)}
        >
          <button className="btn btn-ghost btn-circle">
            <IconHistory className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className="btn btn-ghost btn-circle" onClick={() => openModal(SettingsModalId)}>
            <IconSettings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
