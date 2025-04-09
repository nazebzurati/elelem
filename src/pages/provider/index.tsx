import Drawer from "@components/drawer";
import db from "@lib/database";
import { IconPlus } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { isEmpty } from "radash";

export default function Provider() {
  const providerList = useLiveQuery(async () => {
    const _providerList = await db.provider.toArray();
    return Promise.all(
      _providerList.map(async (provider) => ({
        ...provider,
        models: await db.model
          .where("providerId")
          .equals(provider.id)
          .toArray(),
      }))
    );
  });

  const hideApiKey = (apiKey?: string) => {
    if (!apiKey || isEmpty(apiKey)) return "none";
    return apiKey.substring(0, 4) + "*".repeat(10);
  };

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
        <div className="text-xl font-bold">Provider List</div>
        <p className="text-sm">List of added model provider.</p>
      </div>
      {/* items */}
      <div className="px-4 grid grid-cols-2 gap-2">
        {providerList?.map((provider) => (
          <div className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{provider.baseURL}</h2>
              <p className="text-sm -mt-2 line-clamp-1">
                {hideApiKey(provider.apiKey)}
              </p>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm">View Model</button>
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
