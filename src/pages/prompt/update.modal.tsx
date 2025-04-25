import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@database/config";
import { toggleModal, UiToggleState } from "@utils/toggle";
import usePrompt from "@stores/prompt";
import { IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

export const UpdatePromptModalId = "updatePromptModal";

export default function UpdatePromptModal() {
  const promptStore = usePrompt();
  const selectedPrompt = useLiveQuery(
    async () =>
      promptStore.selectedPromptId
        ? await db.prompt.get(promptStore.selectedPromptId)
        : undefined,
    [promptStore],
  );

  const schema = yup.object().shape({
    title: yup.string().label("Title").required(),
    prompt: yup.string().label("Prompt").required(),
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (selectedPrompt) {
      reset({
        title: selectedPrompt.title,
        prompt: selectedPrompt.prompt,
      });
    }
  }, [selectedPrompt]);

  const onUpdate = async (data: yup.InferType<typeof schema>) => {
    if (!selectedPrompt) return;
    await db.prompt.update(selectedPrompt.id, data);
    toggleModal(UpdatePromptModalId, UiToggleState.CLOSE);
    reset();
  };

  return (
    <dialog id={UpdatePromptModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Update Prompt</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form
          id="updatePromptForm"
          className="text-start"
          onSubmit={handleSubmit(onUpdate)}
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
              className="textarea w-full min-h-10!"
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
            formId="updatePromptForm"
            text="Update"
            isLoading={isLoading || isSubmitting}
          />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
