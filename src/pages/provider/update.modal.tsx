import SubmitButton from "@components/submit-button";
import db from "@database/config";
import { yupResolver } from "@hookform/resolvers/yup";
import useProviderStore from "@stores/provider";
import { IconCircleX, IconX } from "@tabler/icons-react";
import { fetchModelList } from "@utils/conversation";
import { toggleModal, UiToggleState } from "@utils/toggle";
import { useLiveQuery } from "dexie-react-hooks";
import { isEmpty } from "radash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

export const UpdateProviderModalId = "updateProviderModal";

export default function UpdateProviderModal() {
  const providerStore = useProviderStore();
  const selectedProvider = useLiveQuery(
    async () =>
      providerStore.selectedProviderId
        ? await db.provider.get(providerStore.selectedProviderId)
        : undefined,
    [providerStore],
  );

  const schema = yup.object().shape({
    baseURL: yup.string().label("Base URL"),
    apiKey: yup.string().label("API key"),
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
    if (selectedProvider) {
      reset({
        baseURL: selectedProvider.baseURL,
        apiKey: selectedProvider.apiKey,
      });
    }
  }, [selectedProvider]);

  const [error, setError] = useState<string>("");
  const onUpdate = async (data: yup.InferType<typeof schema>) => {
    if (!selectedProvider) return;
    setError("");

    // set base URL
    let baseURL = data.baseURL?.replace(/\/$/, "");
    if (!baseURL || isEmpty(baseURL)) {
      baseURL = "https://api.openai.com/v1";
    }

    // get model list
    let modelIds: string[] = [];
    try {
      modelIds = await fetchModelList(baseURL, data.apiKey);
    } catch (_error) {
      setError("Failed to connect");
      return;
    }
    if (modelIds.length <= 0) {
      setError("No model was found");
      return;
    }

    // add provider
    await db.provider.update(selectedProvider.id, {
      baseURL: baseURL,
      apiKey: data.apiKey,
    });

    // add models
    const providerId = selectedProvider.id;
    const relatedModelList = await db.model.where({ providerId }).toArray();
    await db.model.bulkDelete(relatedModelList.map((m) => m.id));
    await Promise.allSettled(
      modelIds.map(async (modelId) => {
        const isModelIdExisted =
          (await db.model.where({ id: modelId }).count()) > 0;
        if (isModelIdExisted) return;

        await db.model.add({ id: modelId, providerId });
      }),
    );

    toggleModal(UpdateProviderModalId, UiToggleState.CLOSE);
    reset();
  };

  const onErrorDismiss = () => {
    setError("");
  };

  return (
    <dialog id={UpdateProviderModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Update Provider</h3>
          <form method="dialog">
            <button type="submit" className="btn btn-circle btn-ghost">
              <IconX className="h-4 w-4" />
            </button>
          </form>
        </div>
        <form id="updateProviderForm" onSubmit={handleSubmit(onUpdate)}>
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">Host URL</legend>
            </div>
            <input
              type="text"
              className="input w-full"
              placeholder="http://localhost:11434/v1"
              {...register("baseURL")}
            />
            {errors.baseURL ? (
              <p className="fieldset-label text-error">
                {errors.baseURL.message}
              </p>
            ) : (
              <p className="fieldset-label">
                You can leave it blank if you're using OpenAI API key.
              </p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">API Key</legend>
            </div>
            <input
              type="text"
              className="input w-full"
              placeholder="sk-*****"
              {...register("apiKey")}
            />
            {errors.apiKey ? (
              <p className="fieldset-label text-error">
                {errors.apiKey.message}
              </p>
            ) : (
              <p className="fieldset-label">
                You can leave it blank if you're using Ollama.
              </p>
            )}
          </fieldset>
        </form>
        {error && (
          <button
            type="button"
            onClick={onErrorDismiss}
            className="alert alert-error w-full my-2"
          >
            <IconCircleX />
            <div>
              <h3 className="font-bold">{error}</h3>
              <div className="text-xs">Click to dismiss.</div>
            </div>
          </button>
        )}
        <div className="modal-action flex mt-3">
          <SubmitButton
            formId="updateProviderForm"
            text="Next"
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
