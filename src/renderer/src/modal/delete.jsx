import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../lib/database';
import useSettings from '../store/settings';

export const DeleteAssistantModalId = 'deleteAssistantModal';

export default function DeleteAssistantModal() {
  const assistants = useLiveQuery(async () =>
    (await db.assistant.toArray()).map((a, i) => ({ ...a, index: i + 1 }))
  );

  const settingsStore = useSettings();
  const activeAssistant = useMemo(
    () => assistants?.find((a) => a.id === settingsStore.activeAssistantId),
    [assistants, settingsStore.activeAssistantId]
  );

  const onDelete = async () => {
    try {
      settingsStore.setActiveAssistant(undefined);
      const remainingAssistants = assistants.filter((a) => a.id != activeAssistant.id);
      await db.assistant.where({ id: activeAssistant.id }).delete();
      if (remainingAssistants.length > 0) {
        settingsStore.setActiveAssistant(remainingAssistants[0].id);
      }
      document.getElementById(DeleteAssistantModalId).close();
    } catch (error) {
      return;
    }
  };

  return (
    <dialog id={DeleteAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="text-center mb-6">
          <h3 className="font-bold text-lg">Delete '{activeAssistant?.name}'?</h3>
        </div>
        <div>
          <div className="">
            <p>
              Just a heads up - once you say goodbye, they'll be gone for good and{' '}
              <kbd className="kbd">ALT</kbd>
              <kbd className="kbd">{activeAssistant?.index}</kbd> shortcut will be reassigned!
            </p>
          </div>
          <div className="modal-action flex">
            <form method="dialog" className="flex-1">
              <button type="submit" className="w-full btn btn-neutral">
                Cancel
              </button>
            </form>
            <div className="flex-1">
              <button type="button" className="w-full btn btn-error" onClick={onDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
