import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import { fetchModels, updateModelList } from "@lib/model";
import { Model } from "@lib/model.types";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useSettings from "@store/settings";
import { IconCircleX, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

export const SettingsModalId = "settingsModal";

export default function SettingsModal() {
  const settingsStore = useSettings();

  const schema = yup
    .object()
    .shape({ baseURL: yup.string(), apiKey: yup.string() });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: yupResolver(schema) });

  const [error, setError] = useState<string>();
  const onSave = async (data: yup.InferType<typeof schema>) => {
    setError("");

    const newModelList: Model[] = await fetchModels(data.baseURL, data.apiKey);

    try {
      await updateModelList(newModelList);
      settingsStore.update([{ baseURL: data.baseURL, apiKey: data.apiKey }]);
      toggleModal(SettingsModalId, ModalState.CLOSE);
    } catch (_error) {
      setError("Unable to save config");
    }
  };

  const onReset = () => {
    setError("");
    reset({
      apiKey: settingsStore.configs[0].apiKey,
      baseURL: settingsStore.configs[0].baseURL,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reset(undefined, { keepDirtyValues: true });
    }, 1000);
    return () => clearTimeout(timer);
  }, [isSubmitSuccessful]);

  return (
    <dialog id={SettingsModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Settings</h3>
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
                <legend className="fieldset-legend">OpenAI API Key</legend>
              </div>
              <input
                type="text"
                className="input w-full"
                placeholder="sk-*****"
                {...register("apiKey")}
              />
              {errors.apiKey && (
                <p className="fieldset-label text-error">
                  {errors.apiKey.message}
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Ollama API URL</legend>
              </div>
              <input
                type="text"
                className="input w-full"
                placeholder="http://localhost:11434/v1"
                {...register("baseURL")}
              />
              {errors.baseURL && (
                <p className="fieldset-label text-error">
                  {errors.baseURL.message}
                </p>
              )}
            </fieldset>
          </div>
          {error && (
            <div role="alert" className="mt-4 alert alert-error">
              <IconCircleX />
              <span>{error}</span>
            </div>
          )}
          <div className="modal-action flex">
            <button
              type="button"
              className="btn btn-neutral flex-1"
              disabled={isLoading || isSubmitting}
              onClick={onReset}
            >
              Reset
            </button>
            <SubmitButton text="Save" isLoading={isLoading || isSubmitting} />
          </div>
        </form>
      </div>
    </dialog>
  );
}
