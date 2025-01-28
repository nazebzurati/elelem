import { IconEdit, IconHistory, IconPlus, IconSettings } from '@tabler/icons-react';
import { AddAssistantModalId } from '../modal/add';
import { HistoryModalId } from '../modal/history';
import { SettingsModalId } from '../modal/settings';
import { UpdateAssistantModalId } from '../modal/update';

export default function Navbar() {
  const openModal = (id) => {
    document.getElementById(id).showModal();
  };

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Assistant A</summary>
              <ul className="bg-base-200 rounded-t-none p-2 z-300 w-max">
                <li>
                  <a>Assistant B</a>
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
