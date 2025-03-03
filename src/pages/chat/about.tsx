import { IconX } from "@tabler/icons-react";
import { getName, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";

export const AboutModalId = "aboutModal";

export default function AboutModal() {
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
    <dialog id={AboutModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">
            {appInfo.name} v{appInfo.version}
          </h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          <div>
            <p>
              This tool is free because you bring your own LLM or API key to
              connect. The developer uses it as a productivity tool and loves
              sharing it with everyone! If you're enjoying the app, consider
              donating to support ongoing development — it really helps!
            </p>
          </div>
          <div className="modal-action flex">
            <div className="flex-1">
              <a
                target="_blank"
                rel="noreferrer"
                className="w-full btn btn-primary"
                href="https://ko-fi.com/nazebzurati"
              >
                Donate
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
