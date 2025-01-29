import { yupResolver } from '@hookform/resolvers/yup';
import { IconBrandWindowsFilled, IconCircleX, IconSpace } from '@tabler/icons-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as yup from 'yup';
import { db } from '../lib/database';
import { fetchOllamaModels, fetchOpenAiModels } from '../lib/model';
import useSettings from '../store/settings';
import SubmitButton from './submit-button';

function Step1({ setStep }) {
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Hey there!</h1>
        <p>
          We&apos;re thrilled you&apos;re here! Elelem is your friendly assistant that dresses up
          your favorite models in fun personalities—just name them and give a prompt! Switching
          between your personalized pals is a breeze with keyboard shortcuts.
        </p>
        <div className="pt-12">
          <img width={300} height={300} alt="onboarding" src="/onboard.png" className="mx-auto" />
          <a
            className="text-xs"
            rel="noreferrer"
            target="_blank"
            href={
              `https://www.freepik.com/free-vector/teaching-sticker-collection_138668209.htm` +
              `#fromView=search&page=2&position=40&uuid=f07e4c11-4dfa-4a2d-9910-26a91189d384` +
              `&new_detail=true&query=assistant`
            }
          >
            Image by freepik
          </a>
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
    formState: { errors, isLoading, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      openAiApiKey: window.api.decrypt(settingsStore.openAiApiKey),
      ollamaUrl: settingsStore.ollamaUrl
    }
  });

  const [error, setError] = useState();
  const onNext = async (data) => {
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

    try {
      for (const m of modelList) {
        const isExisted = (await db.model.where({ id: m }).count()) > 0;
        if (!isExisted) await db.model.add({ id: m });
      }
    } catch (error) {
      setError('Unable to save retrieved models.');
      return;
    }

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
          Before you get started, there&apos;s a quick step to complete: obtain an OpenAI API key or
          set up your own Ollama server. Make sure you have one of these ready before diving in!
          You&apos;ll need at least one of the OpenAI API or Ollama server, but feel free to provide
          both for extra options.
        </p>
        <div className="text-start">
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
        </div>
        {(errors[''] || error) && (
          <div role="alert" className="alert alert-error">
            <IconCircleX />
            <span>{error || errors['']?.message}</span>
          </div>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-neutral" onClick={() => setStep(1)}>
          Previous
        </button>
        <SubmitButton
          text="Next"
          onClick={handleSubmit(onNext)}
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
    formState: { errors, isLoading, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const [activeAssistantId, setActiveAssistantId] = useState(undefined);
  useEffect(() => {
    if (assistant && assistant.length > 0) {
      setActiveAssistantId(assistant[0].id);
      reset(assistant[0]);
    }
  }, [assistant]);

  const [error, setError] = useState();
  const onNext = async (data) => {
    try {
      if (!activeAssistantId) {
        await db.assistant.add({ name: data.name, modelId: data.modelId, prompt: data.prompt });
      } else {
        await db.assistant.update(activeAssistantId, {
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
          Let&apos;s create your assistant! Pick a name and a prompt, and don&apos;t forget to
          choose the right model to help keep costs down while getting the job done effectively.
        </p>
        <div className="text-start">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Name</legend>
            <input type="text" className="input w-full" placeholder="Elmo" {...register('name')} />
            {errors.name && <p className="fieldset-label text-error">{errors.name.message}</p>}
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
            <p className="fieldset-label">Only chat completion models are supported.</p>
          </fieldset>
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Prompt</legend>
            <textarea
              rows={4}
              type="text"
              className="textarea w-full"
              placeholder={
                `e.g. Reply with playful and engaging conversation between two best ` +
                `friends, similar to how Elmo might speak on Sesame Street.`
              }
              {...register('prompt')}
            />
            {errors.modelId && (
              <p className="fieldset-label text-error">{errors.modelId.message}</p>
            )}
          </fieldset>
        </div>
        {error && (
          <div role="alert" className="alert alert-error">
            <IconCircleX />
            <span>{error || errors['']?.message}</span>
          </div>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-neutral" onClick={() => setStep(2)}>
          Previous
        </button>
        <SubmitButton
          text="Next"
          onClick={handleSubmit(onNext)}
          isLoading={isLoading || isSubmitting}
        />
      </div>
    </>
  );
}

function Step4({ setStep }) {
  const settings = useSettings();
  const navigation = useNavigate();
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">At Your Service!</h1>
        <p>
          Congratulations, your assistant is ready to go! Use{' '}
          <kbd className="kbd">
            <IconBrandWindowsFilled className="w-4 h-4" />
          </kbd>{' '}
          +{' '}
          <kbd className="kbd">
            <IconSpace className="w-4 h-4" />
          </kbd>{' '}
          to summon your assistant, and <kbd className="kbd">CTRL</kbd> +{' '}
          <kbd className="kbd">Number</kbd> to choose your preferred one. Just remember to call your
          assistant first before selecting your favorite!
        </p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button className="btn btn-neutral" onClick={() => setStep(3)}>
          Previous
        </button>
        <button
          className="btn btn-success"
          onClick={() => {
            settings.setOnboardingComplete();
            navigation('/app');
          }}
        >
          Let&apos;s go!
        </button>
      </div>
    </>
  );
}

export { Step1, Step2, Step3, Step4 };
