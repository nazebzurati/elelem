import db from "@lib/database";
import useProvider from "@store/provider";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";

export const ViewProviderModelModalId = "viewProviderModelModal";

export default function ViewProviderModelModal() {
  const providerStore = useProvider();
  const modelList = useLiveQuery(
    async () =>
      providerStore.selectedProviderId
        ? db.model
            .where("providerId")
            .equals(providerStore.selectedProviderId)
            .toArray()
        : undefined,
    [providerStore.selectedProviderId],
  );

  return (
    <dialog id={ViewProviderModelModalId} className="modal">
      <div className="modal-box space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">View Model</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <ul className="list-inside list-disc">
          {modelList?.map((model) => <li>{model.id}</li>)}
        </ul>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
