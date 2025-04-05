import {
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarLeftExpandFilled,
} from "@tabler/icons-react";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

export const DrawerId = "drawer";

export default function Drawer() {
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
        ></label>
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
                <a>New conversation</a>
              </li>
              <li>
                <a>Conversation history</a>
              </li>
            </ul>
          </li>
          <li>
            <h2 className="menu-title">Configuration</h2>
            <ul>
              <li>
                <a>REST API services</a>
              </li>
              <li>
                <a>LLM models</a>
              </li>
              <li>
                <a>Prompts</a>
              </li>
            </ul>
          </li>
          <li className="mt-auto">
            <a>Donate</a>
          </li>
          <li>
            <a>
              {appInfo.name} v{appInfo.version}
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
