import {
  IconChevronLeft,
  IconCodeAsterix,
  IconInfoCircle,
  IconMessages,
  IconServer,
  IconTrashX,
} from "@tabler/icons-react";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { Link } from "react-router-dom";
import { ClearConversationModalId } from "./clear.modal";

export default function Navbar() {
  return (
    <>
      {/* navbar */}
      <div className="navbar bg-base-200">
        <div className="navbar-start">
          <ul className="p-0 menu menu-horizontal">
            <li>
              <Link to="/conversation">
                <IconChevronLeft className="h-6 w-6" />
                Chats
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-center">
          <ul className="p-0 not-sm:hidden menu menu-horizontal">
            <li>
              <Link to="/conversation" className="text-primary">
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
              <Link to="/about">
                <IconInfoCircle className="h-6 w-6" />
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          <button
            type="button"
            className="btn btn-ghost btn-circle"
            onClick={() => {
              toggleModal(ClearConversationModalId, UiToggleState.OPEN);
            }}
          >
            <IconTrashX className="h-6 w-6 text-error" />
          </button>
        </div>
      </div>
      {/* dock */}
      <div className="sm:hidden dock border-t-0 bg-base-200">
        <Link to="/conversation" className="text-primary">
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
        <Link to="/about">
          <IconInfoCircle className="h-6 w-6" />
          <span className="dock-label">About</span>
        </Link>
      </div>
    </>
  );
}
