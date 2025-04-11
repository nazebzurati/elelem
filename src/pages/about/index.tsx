import Drawer from "@components/drawer";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

export default function About() {
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
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex sticky top-0 z-10">
        <div className="navbar-start me-6">
          <Drawer />
        </div>
      </div>
      {/* title */}
      <div className="px-7 py-4 space-y-4 max-w-md">
        <img src="/elelem.png" alt="icon" className="h-16 w-16" />
        <div className="text-xl font-bold">
          {appInfo.name} v{appInfo.version}
        </div>
        <p className="text-justify">
          This tool is free to use because it connects to your own LLM or API
          key. The developer created it as a productivity tools and enjoys
          making it available to others.
        </p>
        <p className="text-justify">
          If you find it helpful, consider supporting its continued development
          with a{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://ko-fi.com/nazebzurati"
          >
            donation
          </a>
          . You can also report any{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/nazebzurati/elelem/issues"
          >
            issues
          </a>{" "}
          to help improve the tool.
        </p>
        <p className="text-justify">
          This application is provided without any warranty. For more
          information, please refer to the{" "}
          <a
            className="link"
            target="_blank"
            rel="noreferrer"
            href="https://github.com/nazebzurati/elelem/blob/main/license.md"
          >
            GNU General Public License version 3 or later
          </a>
          .
        </p>
        <p>© 2025 Nazeb Zurati</p>
      </div>
    </div>
  );
}
