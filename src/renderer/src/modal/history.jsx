import { IconExternalLink, IconTrash, IconX } from '@tabler/icons-react';

export const HistoryModalId = 'historyModal';

export default function HistoryModal() {
  return (
    <dialog id={HistoryModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Conversation History</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <div>
          <div></div>
          <div className="space-y-4"></div>
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="font-bold">Conversation A</p>
              <p className="text-sm text-gray-500">Assistant A, 12:43PM 27/1/2025</p>
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-circle btn-ghost">
                <IconExternalLink className="h-4 w-4" />
              </button>
              <button className="btn btn-circle btn-ghost">
                <IconTrash className="h-4 w-4 text-error" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
