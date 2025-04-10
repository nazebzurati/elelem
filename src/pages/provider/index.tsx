import Drawer from "@components/drawer";
import db from "@lib/database";
import { IconPlus } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import AddProviderModal, { AddProviderModalId } from "./add.modal";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import DeleteProviderModal, { DeleteProviderModalId } from "./delete.modal";
import useProvider from "@store/provider";

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

  const providerStore = useProvider();

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex">
        <div className="navbar-start me-6">
          <Drawer />
        </div>
        <div className="navbar-end">
          <div className="tooltip tooltip-bottom" data-tip="Add provider">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={() => toggleModal(AddProviderModalId, ModalState.OPEN)}
            >
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
      {providerList && providerList.length <= 0 && (
        <div className="px-7">No provider was found.</div>
      )}
      <div className="px-4 grid grid-cols-2 gap-2">
        {providerList?.map((provider) => (
          <div key={provider.id} className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">{provider.baseURL}</h2>
              <p className="text-sm -mt-2 line-clamp-1">
                {provider.apiKey ? `****${provider.apiKey?.slice(-6)}` : "None"}
              </p>
              <div className="card-actions justify-end mt-2">
                <button className="btn">View model</button>
                <button className="btn">Update</button>
                <button
                  className="btn"
                  onClick={() => {
                    providerStore.setSelectedProviderId(provider.id);
                    toggleModal(DeleteProviderModalId, ModalState.OPEN);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* modals */}
      <AddProviderModal />
      <DeleteProviderModal />
    </div>
  );
}
