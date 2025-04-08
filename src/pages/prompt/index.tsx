import db from "@lib/database";
import Drawer from "@components/drawer";
import { useLiveQuery } from "dexie-react-hooks";

export default function Prompt() {
  const promptList = useLiveQuery(async () => db.prompt.toArray());

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6 flex-0">
          <Drawer />
        </div>
      </div>
      {/* title */}
      <div className="p-4 pb-6">
        <div className="text-xl font-bold">Prompt List</div>
        <p>List of available created custom prompt.</p>
      </div>
      {/* items */}
      {promptList && promptList.length <= 0 && (
        <div className="px-4">No custom prompt was found.</div>
      )}
      <div className="px-4 grid grid-cols-3 gap-2">
        {promptList?.map((prompt) => (
          <div className="card card-border bg-base-200">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{prompt.title}</h2>
              <p className="text-sm -mt-2 line-clamp-1">{prompt.prompt}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
