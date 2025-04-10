import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import { IconX } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

export const AddPromptModalId = "addPromptModal";

export default function AddPromptModal() {
  const schema = yup
    .object()
    .shape({ title: yup.string().required(), prompt: yup.string().required() });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onAdd = async (data: yup.InferType<typeof schema>) => {
    await db.prompt.add(data);
    toggleModal(AddPromptModalId, ModalState.CLOSE);
    reset();
  };

  return (
    <dialog id={AddPromptModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Add Prompt</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form
          id="addPromptForm"
          className="text-start"
          onSubmit={handleSubmit(onAdd)}
        >
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">Title</legend>
            </div>
            <input
              type="text"
              className="input w-full"
              placeholder="Rephrase"
              {...register("title")}
            />
            {errors.title && (
              <p className="fieldset-label text-error">
                {errors.title.message}
              </p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">Prompt</legend>
            </div>
            <textarea
              rows={4}
              className="textarea w-full !min-h-10"
              placeholder="e.g. Rephrase the given sentences, shorten it and make sure the fix any grammar mistake. Don't use em dashes, en dashes, and hyphens in the sentences."
              {...register("prompt")}
            />
            {errors.prompt && (
              <p className="fieldset-label text-error">
                {errors.prompt.message}
              </p>
            )}
          </fieldset>
        </form>
        <div className="modal-action flex mt-3">
          <SubmitButton
            formId="addPromptForm"
            text="Add"
            isLoading={isLoading || isSubmitting}
          />
        </div>
      </div>
    </dialog>
  );
}
