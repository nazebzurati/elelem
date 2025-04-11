import Drawer from "@components/drawer";
import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { UiToggleState } from "@lib/utils.types";
import useProvider from "@store/provider";
import { IconPlus } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import AddProviderModal, { AddProviderModalId } from "./add.modal";
import DeleteProviderModal, { DeleteProviderModalId } from "./delete.modal";
import UpdateProviderModal, { UpdateProviderModalId } from "./update.modal";
import ViewProviderModelModal, {
  ViewProviderModelModalId,
} from "./view-model.modal";

export default function Provider() {
  const providerList = useLiveQuery(async () => await db.provider.toArray());
  const providerStore = useProvider();

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex sticky top-0 z-10">
        <div className="flex-none me-2">
          <Drawer />
        </div>
        <div className="flex-1">
          <h1 className="btn btn-ghost text-xl">Provider List</h1>
        </div>
        <div className="flex-none">
          <div className="tooltip tooltip-bottom" data-tip="Add provider">
            <button
              type="button"
              className="btn btn-ghost btn-circle"
              onClick={() =>
                toggleModal(AddProviderModalId, UiToggleState.OPEN)
              }
            >
              <IconPlus className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      {/* items */}
      {providerList && providerList.length <= 0 && (
        <div className="px-7 py-4">No provider was found.</div>
      )}
      <div className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {providerList?.map((provider) => (
          <div key={provider.id} className="card card-border bg-base-300">
            <div className="card-body">
              <h2 className="card-title line-clamp-1">
                {provider.baseURL
                  ? new URL(provider.baseURL).hostname
                  : provider.baseURL}
              </h2>
              <p className="text-sm -mt-2 line-clamp-1">{provider.baseURL}</p>
              <div className="card-actions justify-end mt-2">
                <button
                  type="button"
                  className="btn btn-neutral btn-outline"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(ViewProviderModelModalId, UiToggleState.OPEN);
                  }}
                >
                  View model
                </button>
                <button
                  type="button"
                  className="btn btn-neutral"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(UpdateProviderModalId, UiToggleState.OPEN);
                  }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(DeleteProviderModalId, UiToggleState.OPEN);
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
      <UpdateProviderModal />
      <ViewProviderModelModal />
    </div>
  );
}
