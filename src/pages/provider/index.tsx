import db from "@database/config";
import { toggleModal, UiToggleState } from "@utils/toggle";
import useProvider from "@stores/provider";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import AddProviderModal, { AddProviderModalId } from "./add.modal";
import DeleteProviderModal, { DeleteProviderModalId } from "./delete.modal";
import UpdateProviderModal, { UpdateProviderModalId } from "./update.modal";
import ViewProviderModelModal, {
  ViewProviderModelModalId,
} from "./view-model.modal";
import { useState } from "react";
import { ProviderWithCount } from "@database/provider";
import { fetchModelList } from "@utils/conversation";

export default function Provider() {
  const providerList = useLiveQuery(async () => {
    const _providerList: ProviderWithCount[] = [];
    for (const provider of await db.provider.toArray()) {
      _providerList.push({
        ...provider,
        modelCount: await db.model.where({ providerId: provider.id }).count(),
      });
    }
    return _providerList;
  });
  const providerStore = useProvider();

  const [isRefresh, setIsRefresh] = useState(false);
  const onRefreshModel = async () => {
    if (!providerList || isRefresh) return;
    setIsRefresh(true);

    for (const provider of providerList) {
      // get existing and new model list
      const modelList = await fetchModelList(provider.baseURL, provider.apiKey);
      const existingModelList = (
        await db.model.where({ providerId: provider.id }).toArray()
      ).map((model) => model.id);

      // delete missing model
      const modelIdListToDelete = existingModelList.filter(
        (modelId) => !modelList.includes(modelId)
      );
      for (const modelId of modelIdListToDelete) {
        await db.model.delete(modelId);
      }

      // add new model
      const modelIdListToAdd = modelList.filter(
        (modelId) => !existingModelList.includes(modelId)
      );
      for (const modelId of modelIdListToAdd) {
        await db.model.add({ id: modelId, providerId: provider.id });
      }
    }
    setIsRefresh(false);
  };

  return (
    <div>
      {/* navbar */}
      <div className="navbar bg-base-100 flex-none px-6 flex sticky top-0 z-10">
        <div className="flex-none me-2"></div>
        <div className="flex-1">
          <h1 className="btn btn-ghost text-xl">Provider List</h1>
        </div>
        <div className="flex-none">
          <div className="tooltip tooltip-bottom" data-tip="Refresh provider">
            {isRefresh ? (
              <span className="loading loading-spinner loading-md"></span>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-circle"
                onClick={onRefreshModel}
              >
                <IconRefresh className="h-6 w-6" />
              </button>
            )}
          </div>
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
              <p className="text-sm -mt-2 line-clamp-1">
                {provider.modelCount} model(s) found
              </p>
              <div className="card-actions justify-end mt-2">
                <button
                  type="button"
                  className="btn btn-neutral"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(ViewProviderModelModalId, UiToggleState.OPEN);
                  }}
                >
                  View model
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
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
