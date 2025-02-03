import { yupResolver } from '@hookform/resolvers/yup';
import { IconCircleX } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as yup from 'yup';
import { db, updateModelList } from '../lib/database';
import { fetchOllamaModels, fetchOpenAiModels } from '../lib/model';
import useSettings from '../store/settings';
import SubmitButton from './submit-button';

function Step1({ setStep }) {
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Hey there!</h1>
        <p>
          We're thrilled you're here! Elelem is your friendly assistant that dresses up your
          favorite models in fun personalities—just name them and give a prompt! Switching between
          your personalized pals is a breeze with keyboard shortcuts.
        </p>
        <div className="pt-12">
          <img width={200} height={200} alt="onboarding" src="/andy-wave.png" className="mx-auto" />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="col-start-2 btn btn-primary" onClick={() => setStep(2)}>
          Next
        </button>
      </div>
    </>
  );
}

function Step2({ setStep }) {
  const settingsStore = useSettings();
  const schema = yup
    .object({ openAiApiKey: yup.string(), ollamaUrl: yup.string() })
    .test(
      'openAiApiKey or ollamaUrl',
      'At least one of OpenAi API key or Ollama URL is required.',
      (value) => value.openAiApiKey || value.ollamaUrl
    );
  const {
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
  const onNext = async (data) => {
    setError('');
    let modelList = [];

    if (data.openAiApiKey) {
      const models = await fetchOpenAiModels(data.openAiApiKey);
      if (models.length <= 0) {
        setError('Unable to get OpenAI models.');
        return;
      }
      modelList = modelList.concat(models);
    }

    if (data.ollamaUrl) {
      const models = await fetchOllamaModels(data.ollamaUrl);
      if (models.length <= 0) {
        setError('Unable to get Ollama models.');
        return;
      }
      modelList = modelList.concat(models);
    }

    await updateModelList(modelList);
    settingsStore.update({
      ollamaUrl: data.ollamaUrl,
      openAiApiKey: window.api.encrypt(data.openAiApiKey)
    });
    setStep(3);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Prep Time</h1>
        <p>
          Before you get started, there's a quick step to complete: obtain an OpenAI API key or set
          up your own Ollama server. Make sure you have one of these ready before diving in! You'll
          need at least one of the OpenAI API or Ollama server, but feel free to provide both for
          extra options.
        </p>
        <form id="onboardStep2Form" className="text-start" onSubmit={handleSubmit(onNext)}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">OpenAI API Key</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="sk-*****"
              {...register('openAiApiKey')}
            />
            <p className="fieldset-label">
              Create an API key at https://platform.openai.com/api-keys.
            </p>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Ollama URL</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="http://localhost:11434"
              {...register('ollamaUrl')}
            />
            <p className="fieldset-label">Learn more at https://ollama.com.</p>
          </fieldset>
        </form>
        {(errors[''] || error) && (
          <div role="alert" className="alert alert-error">
            <IconCircleX />
            <span>{error || errors['']?.message}</span>
          </div>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          className="btn btn-neutral"
          onClick={() => setStep(1)}
          disabled={isLoading || isSubmitting}
        >
          Previous
        </button>
        <SubmitButton
          text="Next"
          formId="onboardStep2Form"
          isSubmitted={isSubmitSuccessful}
          isLoading={isLoading || isSubmitting}
        />
      </div>
    </>
  );
}

function Step3({ setStep }) {
  const modelList = useLiveQuery(async () => await db.model.toArray());
  const assistant = useLiveQuery(async () => await db.assistant.toArray());

  const schema = yup
    .object({
      name: yup.string().required('Name is a required field.'),
      modelId: yup.string().required('Model is a required field.'),
      prompt: yup.string()
    })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isSubmitSuccessful }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const settingsStore = useSettings();
  useEffect(() => {
    if (assistant && assistant.length > 0) {
      settingsStore.setActiveAssistant(assistant[0].id);
      reset(assistant[0]);
    }
  }, [assistant]);

  useEffect(() => {
    if (assistant && assistant.length > 0) return;
    if (modelList && modelList.length > 0) {
      reset({ modelId: modelList[0].id });
    }
  }, [modelList]);

  const [error, setError] = useState();
  const onNext = async (data) => {
    try {
      if (!settingsStore.activeAssistantId) {
        const assistant = await db.assistant.add({
          name: data.name,
          modelId: data.modelId,
          prompt: data.prompt
        });
        settingsStore.setActiveAssistant(assistant.id);
      } else {
        await db.assistant.update(settingsStore.activeAssistantId, {
          name: data.name,
          prompt: data.prompt,
          modelId: data.modelId
        });
      }
    } catch (error) {
      setError('Unable to create assistant.');
      return;
    }
    setStep(4);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Designing Assistant</h1>
        <p>
          Let's create your assistant! Pick a name and a prompt, and don't forget to choose the
          right model to help keep costs down while getting the job done effectively.
        </p>
        <form id="onboardStep3Form" className="text-start" onSubmit={handleSubmit(onNext)}>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name (required)</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Rephrase"
              {...register('name')}
            />

            {errors.name ? (
              <p className="fieldset-label text-error">{errors.name.message}</p>
            ) : (
              <p className="fieldset-label">Name will not be provided to model.</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Model</legend>
            <select className="select select-bordered w-full" {...register('modelId')}>
              {modelList?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
            </select>
            {!errors.modelId ? (
              <p className="fieldset-label">Only chat completion models are supported.</p>
            ) : (
              <p className="fieldset-label text-error">{errors.modelId.message}</p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Prompt</legend>
            <textarea
              rows={4}
              type="text"
              className="textarea w-full"
              placeholder="e.g. Rephrase the following sentence, shorten it and make sure the fix any grammar mistake."
              {...register('prompt')}
            />
            <p className="fieldset-label">
              Leave this field empty if you want to use the model without a system prompt.
            </p>
          </fieldset>
        </form>
        {error && (
          <div role="alert" className="alert alert-error">
            <IconCircleX />
            <span>{error || errors['']?.message}</span>
          </div>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          className="btn btn-neutral"
          onClick={() => setStep(2)}
          disabled={isLoading || isSubmitting}
        >
          Previous
        </button>
        <SubmitButton
          text="Next"
          formId="onboardStep3Form"
          isSubmitted={isSubmitSuccessful}
          isLoading={isLoading || isSubmitting}
        />
      </div>
    </>
  );
}

function Step4({ setStep }) {
  const settingsStore = useSettings();
  const navigation = useNavigate();
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">At Your Service!</h1>
        <p>
          Congratulations, your assistant is ready to go! Use <kbd className="kbd">ALT</kbd> +
          number (e.g. <kbd className="kbd">ALT</kbd>
          <kbd className="kbd">1</kbd>) to choose your preferred one.
        </p>
        <div className="pt-12">
          <img
            width={200}
            height={200}
            alt="onboarding"
            src="/andy-dance.png"
            className="mx-auto"
          />
        </div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-neutral" onClick={() => setStep(3)}>
          Previous
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            settingsStore.setOnboardingComplete();
            navigation('/app');
          }}
        >
          Let's go!
        </button>
      </div>
    </>
  );
}

export { Step1, Step2, Step3, Step4 };
