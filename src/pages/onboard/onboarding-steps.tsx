import andyDance from "@assets/andy-dance.png";
import andyWave from "@assets/andy-wave.png";
import SubmitButton from "@components/submit-button";
import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import { fetchModels } from "@lib/model";
import { IconCircleX } from "@tabler/icons-react";
import { useState } from "react";
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
          Elelem is an LLM client. Nothing fancy, just your trusty
          cross-platform sidekick for chatting with smart machines.
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

    // get model list
    let modelIds: string[] = [];
    try {
      modelIds = await fetchModels(data.baseURL, data.apiKey);
    } catch (error) {
      setError("Failed to connect");
      return;
    }
    if (modelIds.length <= 0) {
      setError("No model was found");
      return;
    }

    // add provider and model
    const providerData = { baseURL: data.baseURL, apiKey: data.apiKey };
    const provider = await db.provider.where(providerData).first();
    const providerId = provider
      ? provider.id
      : await db.provider.add(providerData);

    // clear model and add
    await db.model.clear();
    Promise.allSettled(
      modelIds.map(async (modelId, index) => {
        const isModelIdExisted =
          (await db.model.where({ id: modelId }).count()) > 0;
        if (isModelIdExisted) return;
        await db.model.add({
          id: modelId,
          providerId,
          isActive: Number(index === 0),
        });
      })
    );

    setStep(3);
  };

  const onErrorDismiss = () => {
    setError("");
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Prep Time</h1>
        <p className="px-12">
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
              placeholder="http://localhost:11434/v1/"
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
          <button onClick={onErrorDismiss} className="alert alert-error w-full">
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
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  const schema = yup
    .object({ title: yup.string().required(), prompt: yup.string().required() })
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
    await db.prompt.add({
      title: data.title,
      prompt: data.prompt,
    });
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
        {isDirty ? (
          <SubmitButton
            formId="onboardStep3Form"
            text="Next"
            isLoading={isLoading || isSubmitting}
          />
        ) : (
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
