import {
  IconCodeAsterix,
  IconMessages,
  IconPlus,
  IconRefresh,
  IconServer,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="navbar-start">
          <div className="font-bold ms-4 sm:hidden">Providers</div>
        </div>
        <div className="navbar-center">
          <ul className="p-0 not-sm:hidden menu menu-horizontal">
            <li>
              <Link to="/conversation">
                <IconMessages className="h-6 w-6" />
                Chats
              </Link>
            </li>
            <li>
              <Link to="/prompt">
                <IconCodeAsterix className="h-6 w-6" />
                Prompts
              </Link>
            </li>
            <li>
              <Link to="/provider" className="text-primary">
                <IconServer className="h-6 w-6" />
                Providers
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <button className="btn btn-ghost btn-circle">
            <IconRefresh className="h-6 w-6" />
          </button>
          <button className="btn btn-ghost btn-circle">
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
      </div>
      {/* dock */}
      <div className="sm:hidden dock border-t-0 bg-base-200">
        <Link to="/conversation">
          <IconMessages className="h-6 w-6" />
          <span className="dock-label">Chats</span>
        </Link>
        <Link to="/prompt">
          <IconCodeAsterix className="h-6 w-6" />
          <span className="dock-label">Prompts</span>
        </Link>
        <Link to="/provider" className="text-primary">
          <IconServer className="h-6 w-6" />
          <span className="dock-label">Providers</span>
        </Link>
      </div>
    </>
  );
}
