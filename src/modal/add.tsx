import { yupResolver } from "@hookform/resolvers/yup";
import { IconCircleX, IconX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import SubmitButton, {
  BUTTON_ANIMATION_TIMEOUT,
} from "../components/submit-button";
import db from "../lib/database";
import { MODAL_DISMISS_TIMEOUT_MS } from "../lib/const";
import useSettings from "../store/settings";
import { closeModal } from "../lib/modal";

export const AddAssistantModalId = "addAssistantModal";

export default function AddAssistantModal() {
  const modelList = useLiveQuery(async () => await db.model.toArray());

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

  const [error, setError] = useState<string>();
  const settingsStore = useSettings();
  const onAdd = async (data: yup.InferType<typeof schema>) => {
    setError("");
    try {
      const assistantId = await db.assistant.add({
        name: data.name,
        prompt: data.prompt,
        modelId: data.modelId,
      });
      settingsStore.setActiveAssistant(assistantId);
      setTimeout(() => {
        closeModal(AddAssistantModalId);
      }, MODAL_DISMISS_TIMEOUT_MS);
    } catch (_error) {
      setError("Unable to add assistant.");
      return;
    }
  };

  const onReset = () => {
    setError("");
    if (modelList) reset({ modelId: modelList[0].id });
  };

  useEffect(() => {
    if (modelList && modelList.length > 0) {
      const timer = setTimeout(() => {
        reset();
      }, BUTTON_ANIMATION_TIMEOUT);
      return () => clearTimeout(timer);
    }
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
            <button className="btn btn-circle btn-ghost" onClick={onReset}>
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onAdd)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Name (required)</legend>
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
              <legend className="fieldset-legend">Model</legend>
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
              <legend className="fieldset-legend">Prompt</legend>
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
          <div className="modal-action flex">
            <SubmitButton text="Add" isLoading={isLoading || isSubmitting} />
          </div>
        </form>
      </div>
    </dialog>
  );
}
