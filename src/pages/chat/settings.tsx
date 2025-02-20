import { yupResolver } from "@hookform/resolvers/yup";
import {
  fetchOllamaModels,
  fetchOpenAiModels,
  updateModelList,
} from "@lib/model";
import { Model } from "@lib/model.types";
import { toggleModal } from "@lib/utils";
import { ModalState } from "@lib/utils.types";
import useSettings from "@store/settings";
import { IconCircleX, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import SubmitButton from "@components/submit-button";

export const SettingsModalId = "settingsModal";

export default function SettingsModal() {
  const settingsStore = useSettings();

  const schema = yup.object().shape({
    ollamaUrl: yup.string(),
    openAiApiKey: yup
      .string()
      .when("ollamaUrl", (ollamaUrl, schema) =>
        !!ollamaUrl
          ? schema.required(
              "OpenAI API jey is required if Ollama URL key is not provided."
            )
          : schema
      ),
  });

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ollamaUrl: settingsStore.ollamaUrl,
      openAiApiKey: settingsStore.openAiApiKey,
    },
  });

  const [error, setError] = useState<string>();
  const onSave = async (data: yup.InferType<typeof schema>) => {
    setError("");
    let newModelList: Model[] = [];

    if (data.openAiApiKey) {
      const models = await fetchOpenAiModels(data.openAiApiKey);
      if (models.length <= 0) {
        setError("Unable to get OpenAI models.");
        return;
      }
      newModelList = newModelList.concat(models);
    }

    if (data.ollamaUrl) {
      const models = await fetchOllamaModels(data.ollamaUrl);
      if (models.length <= 0) {
        setError("Unable to get Ollama models.");
        return;
      }
      newModelList = newModelList.concat(models);
    }

    try {
      await updateModelList(newModelList);
      settingsStore.update({
        ollamaUrl: data.ollamaUrl,
        openAiApiKey: data.openAiApiKey,
      });
      toggleModal(SettingsModalId, ModalState.CLOSE);
    } catch (_error) {
      setError("Unable to save config");
    }
  };

  const onReset = () => {
    setError("");
    reset({
      openAiApiKey: settingsStore.openAiApiKey,
      ollamaUrl: settingsStore.ollamaUrl,
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
            <button className="btn btn-circle btn-ghost" onClick={onReset}>
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit(onSave)}>
          <div>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">OpenAI API Key</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="sk-*****"
                {...register("openAiApiKey")}
              />
              {errors.openAiApiKey ? (
                <p className="fieldset-label text-error">
                  {errors.openAiApiKey.message}
                </p>
              ) : (
                <p className="fieldset-label">
                  Don't worry, we keep the key to yourself.
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Ollama API URL</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="http://localhost:11434"
                {...register("ollamaUrl")}
              />
              {errors.ollamaUrl ? (
                <p className="fieldset-label text-error">
                  {errors.ollamaUrl.message}
                </p>
              ) : (
                <p className="fieldset-label">Set as empty to disable.</p>
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
