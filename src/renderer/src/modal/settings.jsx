import { yupResolver } from '@hookform/resolvers/yup';
import { IconCircleX, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmitButton from '../components/submit-button';
import { db } from '../lib/database';
import { fetchOllamaModels, fetchOpenAiModels, updateModelList } from '../lib/model';
import useSettings from '../store/settings';

export const SettingsModalId = 'settingsModal';

export default function SettingsModal() {
  const settingsStore = useSettings();

  const schema = yup
    .object({ openAiApiKey: yup.string(), ollamaUrl: yup.string() })
    .test(
      'openAiApiKey or ollamaUrl',
      'At least one of OpenAi API key or Ollama URL is required.',
      (value) => value.openAiApiKey || value.ollamaUrl
    );
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitted }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      openAiApiKey: window.api.decrypt(settingsStore.openAiApiKey),
      ollamaUrl: settingsStore.ollamaUrl
    }
  });

  const [error, setError] = useState();
  const onSave = async (data) => {
    setError('');
    let newModelList = [];

    if (data.openAiApiKey) {
      const models = await fetchOpenAiModels(data.openAiApiKey);
      if (models.length <= 0) {
        setError('Unable to get OpenAI models.');
        return;
      }
      newModelList = newModelList.concat(models);
    }

    if (data.ollamaUrl) {
      const models = await fetchOllamaModels(data.ollamaUrl);
      if (models.length <= 0) {
        setError('Unable to get Ollama models.');
        return;
      }
      newModelList = newModelList.concat(models);
    }

    const existingModelList = (await db.model.toArray()).map((m) => m.id);
    await updateModelList(existingModelList, newModelList);
    settingsStore.update({
      ollamaUrl: data.ollamaUrl,
      openAiApiKey: window.api.encrypt(data.openAiApiKey)
    });
  };

  useEffect(() => {
    reset(undefined, { keepDirtyValues: true });
  }, [!isLoading]);

  return (
    <dialog id={SettingsModalId} className="modal">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg">Settings</h3>
          <form method="dialog">
            <button className="btn btn-circle btn-ghost">
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
                {...register('openAiApiKey')}
              />
              <p className="fieldset-label">Don&apos;t worry, we keep the key to yourself.</p>
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Ollama API URL</legend>
              <input
                type="text"
                className="input w-full"
                placeholder="http://localhost:11434"
                {...register('ollamaUrl')}
              />
              {errors.ollamaUrl ? (
                <p className="fieldset-label text-error">{errors.ollamaUrl.message}</p>
              ) : (
                <p className="fieldset-label">Set as empty to disable.</p>
              )}
            </fieldset>
          </div>
          {(errors[''] || error) && (
            <div role="alert" className="mt-4 alert alert-error">
              <IconCircleX />
              <span>{error || errors['']?.message}</span>
            </div>
          )}
          <div className="modal-action flex">
            <SubmitButton
              text="Save"
              isSubmitted={isSubmitted}
              isFailed={!!errors[''] || !!error}
              isLoading={isLoading || isSubmitting}
            />
          </div>
        </form>
      </div>
    </dialog>
  );
}
