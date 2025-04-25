import andyDance from "@assets/andy-dance.png";
import andyWave from "@assets/andy-wave.png";
import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@database/config";
import { IconCircleX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { isEmpty } from "radash";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { fetchModelList } from "@utils/conversation";

export default function Onboard() {
  const [step, setStep] = useState(1);
  return (
    <div className="h-svh p-8 space-y-10 flex flex-col justify-between">
      <Steps index={step} setStep={setStep} />
    </div>
  );
}

function Steps({
  index,
  setStep,
}: Readonly<{
  index: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  if (index === 2) return <Step2 setStep={setStep} />;
  else if (index === 3) return <Step3 setStep={setStep} />;
  else if (index === 4) return <Step4 setStep={setStep} />;
  return <Step1 setStep={setStep} />;
}

function Step1({
  setStep,
}: Readonly<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Hey there!</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          </div>
        </div>
        <p>
          Elelem is an LLM client. Nothing fancy, just your trusty
          cross-platform sidekick for chatting with smart machines.
        </p>
        <div className="flex h-full">
          <img
            width={150}
            height={150}
            alt="onboarding"
            src={andyWave}
            className="m-auto"
          />
        </div>
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
}: Readonly<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  const existingProvider = useLiveQuery(
    async () => await db.provider.toArray(),
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
    defaultValues: { baseURL: "", apiKey: "" },
  });

  useEffect(() => {
    if (existingProvider && existingProvider.length > 0) {
      reset({
        baseURL: existingProvider[0].baseURL,
        apiKey: existingProvider[0].apiKey,
      });
    }
  }, [existingProvider]);

  const [error, setError] = useState<string>("");
  const onNext = async (data: yup.InferType<typeof schema>) => {
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

    // add provider and model
    const providerData = { baseURL: baseURL, apiKey: data.apiKey };
    const provider = await db.provider.where(providerData).first();
    const providerId = provider
      ? provider.id
      : await db.provider.add(providerData);

    // clear model and add
    await db.model.clear();
    Promise.allSettled(
      modelIds.map(async (modelId) => {
        const isModelIdExisted =
          (await db.model.where({ id: modelId }).count()) > 0;
        if (isModelIdExisted) return;

        await db.model.add({ id: modelId, providerId });
      }),
    );

    setStep(3);
  };

  const onErrorDismiss = () => {
    setError("");
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Prep Time</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          </div>
        </div>
        <p>
          To get started, Elelem just needs a host URL and API key. Any
          OpenAI-compatible provider will do—add one now, more can join later.
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
            {errors.baseURL
              ? (
                <p className="fieldset-label text-error">
                  {errors.baseURL.message}
                </p>
              )
              : (
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
            {errors.apiKey
              ? (
                <p className="fieldset-label text-error">
                  {errors.apiKey.message}
                </p>
              )
              : (
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
            className="alert alert-error w-full"
          >
            <IconCircleX />
            <div>
              <h3 className="font-bold">{error}</h3>
              <div className="text-xs">Click to dismiss.</div>
            </div>
          </button>
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
}: Readonly<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  const schema = yup
    .object({
      title: yup.string().label("Title").required(),
      prompt: yup.string().label("Prompt").required(),
    })
    .required();
  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "", prompt: "" },
  });

  const onNext = async (data: yup.InferType<typeof schema>) => {
    await db.prompt.add({ title: data.title, prompt: data.prompt });
    setStep(4);
  };

  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Personalization</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="h-2 w-2 rounded-full bg-gray-300" />
          </div>
        </div>
        <p>
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
              rows={3}
              className="textarea w-full min-h-10!"
              placeholder="e.g. Rephrase the given sentences, shorten it and make sure the fix any grammar mistake. Don't use em dashes, en dashes, and hyphens in the sentences."
              {...register("prompt")}
            />
            {errors.prompt && (
              <p className="fieldset-label text-error">
                {errors.prompt.message}
              </p>
            )}
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
        {isDirty
          ? (
            <SubmitButton
              formId="onboardStep3Form"
              text="Next"
              isLoading={isLoading || isSubmitting}
            />
          )
          : (
            <button
              type="button"
              className="btn btn-primary btn-outline"
              onClick={() => setStep(4)}
            >
              Skip
            </button>
          )}
      </div>
    </>
  );
}

function Step4({
  setStep,
}: Readonly<{
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  const navigation = useNavigate();
  return (
    <>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">At Your Service!</h1>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-gray-600" />
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
        <p>Congratulations, we're good to go.</p>
        <div className="flex h-full">
          <img
            width={150}
            height={150}
            alt="onboarding"
            src={andyDance}
            className="m-auto"
          />
        </div>
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
          onClick={() => navigation("/conversation")}
        >
          Let's go!
        </button>
      </div>
    </>
  );
}
