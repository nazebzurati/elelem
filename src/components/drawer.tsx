import { toggleDrawer } from "@lib/utils";
import { UiToggleState } from "@lib/utils.types";
import useSettings from "@store/settings";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const DrawerId = "drawer";

export default function Drawer() {
  const settingsStore = useSettings();
  const navigation = useNavigate();

  const [appInfo, setAppInfo] = useState({ name: "n/a", version: "n/a" });
  useEffect(() => {
    (async () => {
      setAppInfo({
        name: await getName(),
        version: await getVersion(),
      });
    })();
  }, []);

  return (
    <div className="drawer">
      <input id={DrawerId} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label htmlFor={DrawerId} className="drawer-button">
          <IconMenu2 className="h-6 w-6" />
        </label>
      </div>
      <div className="drawer-side z-2">
        <label
          htmlFor={DrawerId}
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-2">
          <li className="py-2">
            <label
              htmlFor={DrawerId}
              aria-label="close sidebar"
              className="drawer-overlay"
            >
              <IconX className="h-6 w-6" />
            </label>
          </li>
          <li>
            <h2 className="menu-title">Conversation</h2>
            <ul>
              <li>
                <button
                  type="button"
                  aria-label="close sidebar"
                  onClick={() => {
                    settingsStore.setActiveConversation(undefined);
                    navigation("/chat");
                    toggleDrawer(DrawerId, UiToggleState.CLOSE);
                  }}
                >
                  New Conversation
                </button>
              </li>
              <DrawerItemPath text="Conversation" path="/chat" />
              <DrawerItemPath text="History" path="/history" />
            </ul>
          </li>
          <li>
            <h2 className="menu-title">Configuration</h2>
            <ul>
              <DrawerItemPath text="Provider List" path="/provider" />
              <DrawerItemPath text="Prompt List" path="/prompt" />
            </ul>
          </li>
          <li className="mt-auto">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://ko-fi.com/nazebzurati"
            >
              Donate
            </a>
          </li>
          <DrawerItemPath
            text={`${appInfo.name} v${appInfo.version}`}
            path="/about"
          />
        </ul>
      </div>
    </div>
  );
}

const DrawerItemPath = ({ path, text }: { path: string; text: string }) => {
  const location = useLocation();
  const className = path === location.pathname ? "font-bold text-primary" : "";
  return (
    <li>
      <a href={path} className={className}>
        {text}
      </a>
    </li>
  );
};
