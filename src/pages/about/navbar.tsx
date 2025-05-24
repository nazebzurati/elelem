import {
  IconCodeAsterix,
  IconInfoCircle,
  IconMessages,
  IconServer,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

export default function Navbar({
  name,
  version,
}: {
  name: string;
  version: string;
}) {
  return (
    <>
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="navbar-start">
          <div className="ms-4 font-bold sm:hidden">
            {name} v{version}
          </div>
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
              <Link to="/provider">
                <IconServer className="h-6 w-6" />
                Providers
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-primary">
                <IconInfoCircle className="h-6 w-6" />
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end"></div>
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
        <Link to="/provider">
          <IconServer className="h-6 w-6" />
          <span className="dock-label">Providers</span>
        </Link>
        <Link to="/about" className="text-primary">
          <IconInfoCircle className="h-6 w-6" />
          <span className="dock-label">About</span>
        </Link>
      </div>
    </>
  );
}
