import { yupResolver } from '@hookform/resolvers/yup';
import { IconX } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

export const AddAssistantModalId = 'addAssistantModal';

export default function AddAssistantModal() {
  const schema = yup
    .object({
      model: yup.string().required(),
      name: yup.string().required(),
      prompt: yup.string()
    })
    .required();
  const {
    register,
    handleSubmit,
    formState: { isLoading, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSave = () => {};

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
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Assistant Name</legend>
              <input type="text" className="input w-full" {...register('name')} />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Assistant Model</legend>
              <select className="select select-bordered w-full" {...register('model')}>
                <option value="modelA">Model A</option>
                <option value="modelB">Model B</option>
                <option value="modelC">Model C</option>
              </select>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Assistant Prompt</legend>
              <textarea rows={4} type="text" className="textarea w-full" {...register('prompt')} />
            </fieldset>
          </div>
          <div className="modal-action flex">
            <button className="btn btn-primary flex-1" disabled={isLoading || isSubmitting}>
              Save
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
