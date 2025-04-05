import andyDance from "@assets/andy-dance.png";
import andyWave from "@assets/andy-wave.png";
import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import { fetchModels, updateModelList } from "@lib/model";
import { Model } from "@lib/model.types";
import useSettings from "@store/settings";
import { IconCircleX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import * as yup from "yup";

function Step1({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Hey there!</h1>
        <p className="px-12">
          Elelem is an LLM client that lets you seamlessly switch instructions
          using shortcuts while working with your favorite models. Customize
          your interactions and swap contexts effortlessly—making AI assistance
          faster and more intuitive than ever!
        </p>
        <img
          width={150}
          height={150}
          alt="onboarding"
          src={andyWave}
          className="mx-auto"
        />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          className="col-start-2 btn btn-primary"
          onClick={() => setStep(2)}
        >
          Next
        </button>
      </div>
    </>
  );
}

function Step2({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const settingsStore = useSettings();

  const schema = yup
    .object()
    .shape({ baseURL: yup.string(), apiKey: yup.string() });

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const [error, setError] = useState<string>("");
  const onNext = async (data: yup.InferType<typeof schema>) => {
    setError("");

    const modelList: Model[] = await fetchModels(data.baseURL, data.apiKey);
    await updateModelList(modelList);
    settingsStore.update([{ baseURL: data.baseURL, apiKey: data.apiKey }]);

    setStep(3);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Prep Time</h1>
        <p className="px-12">
          Before you start, Elelem needs an OpenAI-compatible setup—a host URL
          and API key. Any LLM aggregator or backend following the OpenAI Chat
          Completion API spec will work! Let's add one service first—you can add
          more later.
        </p>
        <form
          id="onboardStep2Form"
          className="text-start w-full"
          onSubmit={handleSubmit(onNext)}
        >
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
            {errors.baseURL && (
              <p className="fieldset-label text-error">
                {errors.baseURL.message}
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
            {errors.apiKey && (
              <p className="fieldset-label text-error">
                {errors.apiKey.message}
              </p>
            )}
          </fieldset>
        </form>
        {error && (
          <div role="alert" className="alert alert-error">
            <IconCircleX />
            <span>{error}</span>
          </div>
        )}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn btn-neutral"
          onClick={() => setStep(1)}
          disabled={isLoading || isSubmitting}
        >
          Previous
        </button>
        <SubmitButton
          formId="onboardStep2Form"
          text="Next"
          isLoading={isLoading || isSubmitting}
        />
      </div>
    </>
  );
}

function Step3({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const prompts = useLiveQuery(async () => await db.prompt.toArray());

  const schema = yup
    .object({ title: yup.string(), prompt: yup.string() })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const settingsStore = useSettings();
  useEffect(() => {
    if (prompts && prompts.length > 0) {
      settingsStore.setActivePrompt(prompts[0].id);
      reset(prompts[0]);
    }
  }, [prompts]);

  const onNext = async (data: yup.InferType<typeof schema>) => {
    if (data.title && data.prompt) {
      await db.prompt.add({
        title: data.title,
        prompt: data.prompt,
      });
    }
    setStep(4);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Personalization</h1>
        <p className="px-12">
          Let's customize your assistant with prompt or instruction! Pick a
          title and write a prompt to shape its behavior. However, this is
          optional if you want to use a model without a prompt.
        </p>
        <form
          id="onboardStep3Form"
          className="text-start"
          onSubmit={handleSubmit(onNext)}
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
              rows={2}
              className="textarea w-full !min-h-10"
              placeholder="e.g. Rephrase the following sentence, shorten it and make sure the fix any grammar mistake."
              {...register("prompt")}
            />
          </fieldset>
        </form>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn btn-neutral"
          onClick={() => setStep(2)}
          disabled={isLoading || isSubmitting}
        >
          Previous
        </button>
        <SubmitButton
          formId="onboardStep3Form"
          text="Next"
          isLoading={isLoading || isSubmitting}
        />
      </div>
    </>
  );
}

function Step4({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const navigation = useNavigate();
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">At Your Service!</h1>
        <p className="px-12">Congratulations, we're good to go.</p>
        <img
          width={150}
          height={150}
          alt="onboarding"
          src={andyDance}
          className="mx-auto"
        />
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn btn-neutral"
          onClick={() => setStep(3)}
        >
          Previous
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={() => navigation("/chat")}
        >
          Let's go!
        </button>
      </div>
    </>
  );
}

export { Step1, Step2, Step3, Step4 };
