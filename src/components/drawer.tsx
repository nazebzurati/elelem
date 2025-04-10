import useSettings from "@store/settings";
import {
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarLeftExpandFilled,
} from "@tabler/icons-react";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

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
          <IconLayoutSidebarLeftExpandFilled className="h-6 w-6" />
        </label>
      </div>
      <div className="drawer-side z-2">
        <label
          htmlFor={DrawerId}
          aria-label="close sidebar"
          className="drawer-overlay"
        />
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          <li>
            <label
              htmlFor={DrawerId}
              aria-label="close sidebar"
              className="drawer-overlay"
            >
              <IconLayoutSidebarLeftCollapseFilled className="h-6 w-6" />
            </label>
          </li>
          <li>
            <h2 className="menu-title">Conversation</h2>
            <ul>
              <li>
                <button
                  onClick={() => {
                    settingsStore.setActiveConversation(undefined);
                    navigation("/chat");
                  }}
                >
                  New conversation
                </button>
              </li>
              <li>
                <a href="/history">Conversation history</a>
              </li>
            </ul>
          </li>
          <li>
            <h2 className="menu-title">Configuration</h2>
            <ul>
              <li>
                <a href="/provider">Providers</a>
              </li>
              <li>
                <a href="/prompt">Prompts</a>
              </li>
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
          <li>
            <a href="/about">
              {appInfo.name} v{appInfo.version}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
