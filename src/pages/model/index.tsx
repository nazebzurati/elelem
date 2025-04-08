import Drawer from "@components/drawer";
import db from "@lib/database";
import { useLiveQuery } from "dexie-react-hooks";

export default function Model() {
  const modelList = useLiveQuery(async () => {
    const models = await db.model.toArray();
    return Promise.all(
      models.map(async (model) => ({
        ...model,
        provider: (await db.provider.get(model.providerId))!,
      }))
    );
  });

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6 flex-0">
          <Drawer />
        </div>
      </div>
      {/* title */}
      <div className="ps-7 pb-8 pt-2">
        <div className="text-xl font-bold">Model List</div>
        <p className="text-sm">Available LLM model.</p>
      </div>
      {/* items */}
      <div className="px-4 grid grid-cols-3 gap-2">
        {modelList?.map((model) => (
          <div className="card card-border bg-base-200">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{model.id}</h2>
              <p className="text-sm -mt-2 line-clamp-1">
                {model.provider.baseURL}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
