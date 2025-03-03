import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useSettings from "@store/settings";
import { IconCircleX, IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { DeleteAssistantModalId } from "./delete";

export const UpdateAssistantModalId = "updateAssistantModal";

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
      name: yup.string().required("Name is a required field."),
      modelId: yup.string().required("Model is a required field."),
      prompt: yup.string(),
    })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (activeAssistant) {
      reset(activeAssistant);
    }
  }, [activeAssistant, modelList]);

  useEffect(() => {
    const timer = setTimeout(() => {
      reset(activeAssistant);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSubmitSuccessful]);

  const [error, setError] = useState<string>();
  const onSave = async (data: yup.InferType<typeof schema>) => {
    if (!activeAssistant) return;
    setError("");
    try {
      await db.assistant.update(activeAssistant.id, {
        name: data.name,
        prompt: data.prompt,
        modelId: data.modelId,
      });
      toggleModal(UpdateAssistantModalId, ModalState.CLOSE);
    } catch (_error) {
      setError("Unable to update assistant.");
      return;
    }
  };

  const onDelete = () => {
    toggleModal(UpdateAssistantModalId, ModalState.CLOSE);
    toggleModal(DeleteAssistantModalId, ModalState.OPEN);
  };

  return (
    <dialog id={UpdateAssistantModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Update Assistant</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Name (required)</legend>
              </div>
              <input
                type="text"
                className="input w-full"
                {...register("name")}
              />
              {errors.name && (
                <p className="fieldset-label text-error">
                  {errors.name.message}
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Model</legend>
              </div>
              <select
                className="select select-bordered w-full"
                {...register("modelId")}
              >
                {modelList?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
              {errors.modelId ? (
                <p className="fieldset-label text-error">
                  {errors.modelId.message}
                </p>
              ) : (
                <p className="fieldset-label">
                  Only chat completion models are supported.
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Prompt</legend>
              </div>
              <textarea
                rows={4}
                className="textarea w-full"
                {...register("prompt")}
              />
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
            <SubmitButton text="Save" isLoading={isLoading || isSubmitting} />
          </div>
        </form>
      </div>
    </dialog>
  );
}
