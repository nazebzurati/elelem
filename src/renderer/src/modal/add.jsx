import { yupResolver } from '@hookform/resolvers/yup';
import { IconX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmitButton from '../components/submit-button';
import { db } from '../lib/database';

export const AddAssistantModalId = 'addAssistantModal';

export default function AddAssistantModal() {
  const modelList = useLiveQuery(async () => await db.model.toArray());

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

  const [error, setError] = useState();
  const onCreate = async (data) => {
    setError('');
    try {
      await db.assistant.add({
        name: data.name,
        prompt: data.prompt,
        modelId: data.modelId
      });
    } catch (error) {
      setError('Unable to add assistant.');
      return;
    }
  };

  useEffect(() => {
    reset();
  }, [isSubmitSuccessful]);

  useEffect(() => {
    if (modelList && modelList.length > 0) {
      reset({ modelId: modelList[0].id });
    }
  }, [modelList]);

  return (
    <dialog id={AddAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Add Assistant</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form>
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
          <div className="modal-action flex">
            <SubmitButton
              text="Add"
              isFailed={!!error}
              isSubmitted={isSubmitSuccessful}
              onClick={handleSubmit(onCreate)}
              isLoading={isLoading || isSubmitting}
            />
          </div>
        </form>
      </div>
    </dialog>
  );
}
