import db from "@database/config";
import { ProviderWithCount } from "@database/provider";
import useProvider from "@stores/provider";
import { IconEdit, IconList, IconTrash } from "@tabler/icons-react";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { useLiveQuery } from "dexie-react-hooks";
import AddProviderModal from "./add.modal";
import DeleteProviderModal, { DeleteProviderModalId } from "./delete.modal";
import Navbar from "./navbar";
import UpdateProviderModal, { UpdateProviderModalId } from "./update.modal";
import ViewProviderModelModal, {
  ViewProviderModelModalId,
} from "./view-model.modal";

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

  return (
    <div>
      {/* navbar */}
      <Navbar providerList={providerList} />
      {/* items */}
      <div className="p-4 flex justify-center">
        <ul className="list bg-base-200 rounded-box w-xl">
          {providerList && providerList.length <= 0 && (
            <li className="list-row flex text-center">
              <p className="w-full">No provider was found.</p>
            </li>
          )}
          {providerList?.map((provider) => (
            <li key={provider.id} className="list-row flex">
              <div className="flex-1">
                <div className="text-base font-bold">
                  {provider.baseURL ? new URL(provider.baseURL).hostname : "?"}
                </div>
                <div className="text-sm opacity-60">
                  {provider.modelCount} model(s) found
                </div>
              </div>
              <div>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(ViewProviderModelModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconList className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(UpdateProviderModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconEdit className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="btn btn-square btn-ghost"
                  onClick={() => {
                    providerStore.setSelectedProvider(provider.id);
                    toggleModal(DeleteProviderModalId, UiToggleState.OPEN);
                  }}
                >
                  <IconTrash className="w-6 h-6 text-error" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* modals */}
      <AddProviderModal />
      <DeleteProviderModal />
      <UpdateProviderModal />
      <ViewProviderModelModal />
    </div>
  );
}
