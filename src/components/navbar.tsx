import {
  IconChevronLeft,
  IconCodeAsterix,
  IconMessageCirclePlus,
  IconMessages,
  IconServer,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  const isHighlighted = (expectedPath: string) => {
    return location.pathname === expectedPath ? "text-primary" : "";
  };

  const isHighlightedDock = (expectedPath: string) => {
    return location.pathname === expectedPath ? "dock-ctive" : "";
  };

  return (
    <>
      {/* navbar */}
      {location.pathname !== "/history" && (
        <div className="navbar">
          <div className="navbar-start">
            <ul className="not-sm:hidden menu menu-horizontal">
              {location.pathname !== "/history" && (
                <li>
                  <Link to="/history">
                    <IconChevronLeft className="h-6 w-6" />
                    History
                  </Link>
                </li>
              )}
            </ul>
          </div>
          <div className="navbar-center">
            <ul className="not-sm:hidden menu menu-horizontal">
              <li>
                <Link
                  to="/conversation"
                  className={isHighlighted("/conversation")}
                >
                  <IconMessages className="h-6 w-6" />
                  Chats
                </Link>
              </li>
              <li>
                <Link to="/prompt" className={isHighlighted("/prompt")}>
                  <IconCodeAsterix className="h-6 w-6" />
                  Prompts
                </Link>
              </li>
              <li>
                <Link to="/provider" className={isHighlighted("/provider")}>
                  <IconServer className="h-6 w-6" />
                  Providers
                </Link>
              </li>
            </ul>
          </div>
          <div className="navbar-end">
            {location.pathname === "/conversation" && (
              <button className="btn btn-ghost btn-circle">
                <IconMessageCirclePlus className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
      {/* dock */}
      <div className="sm:hidden dock">
        <Link to="/conversation" className={isHighlightedDock("/conversation")}>
          <IconMessages className="h-6 w-6" />
          <span className="dock-label">Chats</span>
        </Link>
        <Link to="/prompt" className={isHighlightedDock("/prompt")}>
          <IconCodeAsterix className="h-6 w-6" />
          <span className="dock-label">Prompts</span>
        </Link>
        <Link to="/provider" className={isHighlightedDock("/provider")}>
          <IconServer className="h-6 w-6" />
          <span className="dock-label">Providers</span>
        </Link>
      </div>
    </>
  );
}
