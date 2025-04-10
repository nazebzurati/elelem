import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useProvider from "@store/provider";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";

export const DeleteProviderModalId = "deleteProviderModal";

export default function DeleteProviderModal() {
  const providerStore = useProvider();

  const selectedProvider = useLiveQuery(
    async () =>
      providerStore.selectedProviderId
        ? db.provider.get(providerStore.selectedProviderId)
        : undefined,
    [providerStore.selectedProviderId]
  );

  const onDelete = async () => {
    if (!providerStore.selectedProviderId) {
      return;
    }

    const providerRelatedModelId = (
      await db.model
        .where("providerId")
        .equals(providerStore.selectedProviderId)
        .toArray()
    ).map((m) => m.id);
    await db.model.bulkDelete(providerRelatedModelId);
    await db.provider.delete(providerStore.selectedProviderId);
    toggleModal(DeleteProviderModalId, ModalState.CLOSE);
  };

  return (
    <dialog id={DeleteProviderModalId} className="modal">
      <div className="modal-box space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Delete Provider</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          Deleting '{selectedProvider?.baseURL}' provider removes its models,
          but existing chats created by the related model will remain; just no
          longer connected to any provider.
        </div>
        <div className="modal-action flex mt-3">
          <button
            type="button"
            onClick={onDelete}
            className="w-full btn btn-error"
          >
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}
