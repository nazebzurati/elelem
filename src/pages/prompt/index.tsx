import db from "@lib/database";
import Drawer from "@components/drawer";
import { useLiveQuery } from "dexie-react-hooks";
import { IconPlus } from "@tabler/icons-react";

export default function Prompt() {
  const promptList = useLiveQuery(async () => db.prompt.toArray());

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6">
          <Drawer />
        </div>
        <div className="navbar-end">
          <div className="tooltip tooltip-bottom" data-tip="Add provider">
            <button type="button" className="btn btn-ghost btn-circle">
              <IconPlus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* title */}
      <div className="ps-7 pb-8 pt-2">
        <div className="text-xl font-bold">Prompt List</div>
        <p>List of created prompt.</p>
      </div>
      {/* items */}
      {promptList && promptList.length <= 0 && (
        <div className="px-7">No prompt was found.</div>
      )}
      <div className="px-4 grid grid-cols-2 gap-2">
        {promptList?.map((prompt) => (
          <div key={prompt.id} className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{prompt.title}</h2>
              <p className="text-sm -mt-2 line-clamp-1">{prompt.prompt}</p>
              <div className="card-actions justify-end mt-2">
                <button className="btn btn-sm">Update</button>
                <button className="btn btn-sm">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
