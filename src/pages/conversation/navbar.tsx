import {
  IconCodeAsterix,
  IconMessageCirclePlus,
  IconMessages,
  IconServer,
} from "@tabler/icons-react";

export default function Navbar() {
  return (
    <>
      {/* navbar */}
      <div className="navbar">
        <div className="navbar-start">
          <a className="btn btn-ghost text-xl">Elelem</a>
        </div>
        <div className="navbar-center">
          <ul className="not-sm:hidden menu menu-horizontal">
            <li>
              <a className="text-primary">
                <IconMessages className="h-6 w-6" />
                Chats
              </a>
            </li>
            <li>
              <a>
                <IconCodeAsterix className="h-6 w-6" />
                Prompts
              </a>
            </li>
            <li>
              <a>
                <IconServer className="h-6 w-6" />
                Providers
              </a>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <button className="btn btn-ghost btn-circle">
            <IconMessageCirclePlus className="h-6 w-6" />
          </button>
        </div>
      </div>
      {/* dock */}
      <div className="sm:hidden dock">
        <button className="dock-active">
          <IconMessages className="h-6 w-6" />
          <span className="dock-label">Chats</span>
        </button>
        <button>
          <IconCodeAsterix className="h-6 w-6" />
          <span className="dock-label">Prompts</span>
        </button>
        <button>
          <IconServer className="h-6 w-6" />
          <span className="dock-label">Providers</span>
        </button>
      </div>
    </>
  );
}
