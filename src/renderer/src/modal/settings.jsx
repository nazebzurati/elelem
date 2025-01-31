import { yupResolver } from '@hookform/resolvers/yup';
import { IconCircleX, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import SubmitButton, { BUTTON_ANIMATION_TIMEOUT } from '../components/submit-button';
import { updateModelList } from '../lib/database';
import { fetchOllamaModels, fetchOpenAiModels } from '../lib/model';
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
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful }
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

    try {
      await updateModelList(newModelList);
      settingsStore.update({
        ollamaUrl: data.ollamaUrl,
        openAiApiKey: window.api.encrypt(data.openAiApiKey)
      });
    } catch (error) {
      setError('Unable to save config');
    }
  };

  const onReset = () => {
    setError('');
    reset({
      openAiApiKey: window.api.decrypt(settingsStore.openAiApiKey),
      ollamaUrl: settingsStore.ollamaUrl
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      reset(undefined, { keepDirtyValues: true });
    }, BUTTON_ANIMATION_TIMEOUT);
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
                {...register('openAiApiKey')}
              />
              <p className="fieldset-label">Don't worry, we keep the key to yourself.</p>
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
            <button
              type="button"
              className="btn btn-neutral flex-1"
              disabled={isLoading || isSubmitting}
              onClick={onReset}
            >
              Reset
            </button>
            <SubmitButton
              text="Save"
              isSubmitted={isSubmitSuccessful}
              isFailed={!!errors[''] || !!error}
              isLoading={isLoading || isSubmitting}
            />
          </div>
        </form>
      </div>
    </dialog>
  );
}
