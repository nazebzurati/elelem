import { IconSettings } from '@tabler/icons-react'

export default function Navbar() {
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
        <button className="btn btn-ghost btn-circle">
          <IconSettings className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
