import db from "@database/config";
import useProvider from "@stores/provider";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";

export const ViewProviderModelModalId = "viewProviderModelModal";

export default function ViewProviderModelModal() {
  const providerStore = useProvider();
  const modelList = useLiveQuery(
    async () =>
      providerStore.selectedProviderId
        ? await db.model
            .where({ providerId: providerStore.selectedProviderId })
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
        <div className="overflow-y-auto max-h-60">
          {modelList?.map((model) => model.id).join(", ")}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
