import { yupResolver } from '@hookform/resolvers/yup';
import { IconX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmitButton from '../components/submit-button';
import { db } from '../lib/database';
import useSettings from '../store/settings';

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
    }, 2000);
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
    } catch (error) {
      setError('Unable to update assistant.');
      return;
    }
  };

  const onDelete = async () => {
    try {
      settingsStore.setActiveAssistant(undefined);
      const remainingAssistants = assistants.filter((a) => a.id != activeAssistant.id);
      await db.assistant.where({ id: activeAssistant.id }).delete();
      if (remainingAssistants.length > 0) {
        settingsStore.setActiveAssistant(remainingAssistants[0].id);
      }
    } catch (error) {
      setError('Unable to delete assistant.');
      return;
    }
  };

  return (
    <dialog id={UpdateAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Update Assistant</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Name</legend>
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
