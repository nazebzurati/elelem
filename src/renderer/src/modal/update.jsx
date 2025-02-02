import { yupResolver } from '@hookform/resolvers/yup';
import { IconX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmitButton, { BUTTON_ANIMATION_TIMEOUT } from '../components/submit-button';
import { db } from '../lib/database';
import { MODAL_DISMISS_TIMEOUT_MS } from '../lib/modal';
import useSettings from '../store/settings';
import { DeleteAssistantModalId } from './delete';

export const UpdateAssistantModalId = 'updateAssistantModal';

export default function UpdateAssistantModal() {
  const modelList = useLiveQuery(async () => await db.model.toArray());
  const assistants = useLiveQuery(async () => await db.assistant.toArray());

  const settingsStore = useSettings();
  const activeAssistant = useMemo(
    () => assistants?.find((a) => a.id === settingsStore.activeAssistantId),
    [assistants, settingsStore.activeAssistantId]
  );

  const schema = yup
    .object({
      name: yup.string().required('Name is a required field.'),
      modelId: yup.string().required('Model is a required field.'),
      prompt: yup.string()
    })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful }
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (activeAssistant) {
      reset(activeAssistant);
    }
  }, [activeAssistant, modelList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      reset(activeAssistant);
    }, BUTTON_ANIMATION_TIMEOUT);
    return () => clearTimeout(timer);
  }, [isSubmitSuccessful]);

  const [error, setError] = useState();
  const onSave = async (data) => {
    setError('');
    try {
      await db.assistant.update(activeAssistant.id, {
        name: data.name,
        prompt: data.prompt,
        modelId: data.modelId
      });
      setTimeout(() => {
        document.getElementById(UpdateAssistantModalId).close();
      }, MODAL_DISMISS_TIMEOUT_MS);
    } catch (error) {
      setError('Unable to update assistant.');
      return;
    }
  };

  const onReset = () => {
    setError('');
    reset(activeAssistant);
  };

  const onDelete = () => {
    document.getElementById(UpdateAssistantModalId).close();
    setTimeout(() => {
      document.getElementById(DeleteAssistantModalId).showModal();
    }, MODAL_DISMISS_TIMEOUT_MS);
  };

  return (
    <dialog id={UpdateAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Update Assistant</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost" onClick={onReset}>
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Name (required)</legend>
              <input type="text" className="input w-full" {...register('name')} />
              {errors.name && <p className="fieldset-label text-error">{errors.name.message}</p>}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Model</legend>
              <select className="select select-bordered w-full" {...register('modelId')}>
                {modelList?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
              {errors.modelId ? (
                <p className="fieldset-label text-error">{errors.modelId.message}</p>
              ) : (
                <p className="fieldset-label">Only chat completion models are supported.</p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Prompt</legend>
              <textarea rows={4} type="text" className="textarea w-full" {...register('prompt')} />
            </fieldset>
          </div>
          {error && (
            <div role="alert" className="alert alert-error">
              <IconCircleX />
              <span>{error}</span>
            </div>
          )}
          <div className="modal-action flex space-x-1">
            <button
              type="button"
              className="btn btn-error flex-1"
              disabled={isLoading || isSubmitting}
              onClick={onDelete}
            >
              Delete
            </button>
            <SubmitButton
              text="Save"
              isSubmitted={isSubmitSuccessful}
              isLoading={isLoading || isSubmitting}
            />
          </div>
        </form>
      </div>
    </dialog>
  );
}
