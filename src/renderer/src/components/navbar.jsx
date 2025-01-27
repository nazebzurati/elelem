import { IconPlus, IconSettings, IconSparkles } from '@tabler/icons-react'
import { SettingsModalId } from '../modal/settings'

export default function Navbar() {
  const openSettingsModal = () => {
    document.getElementById(SettingsModalId).showModal()
  }

  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <ul className="menu menu-horizontal px-1">
          <li>
            <details>
              <summary>Current model</summary>
              <ul className="bg-base-100 rounded-t-none p-2 z-300">
                <li>
                  <a>Link 1</a>
                </li>
                <li>
                  <a>Link 2</a>
                </li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="tooltip tooltip-bottom" data-tip="Add new model">
          <button className="btn btn-ghost btn-circle">
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Personalisation">
          <button className="btn btn-ghost btn-circle">
            <IconSparkles className="h-6 w-6" />
          </button>
        </div>
        <div className="tooltip tooltip-bottom" data-tip="Settings">
          <button className="btn btn-ghost btn-circle" onClick={openSettingsModal}>
            <IconSettings className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
