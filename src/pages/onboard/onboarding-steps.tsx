import { yupResolver } from "@hookform/resolvers/yup";
import db from "@lib/database";
import {
  fetchOllamaModels,
  fetchOpenAiModels,
  updateModelList,
} from "@lib/model";
import { Model } from "@lib/model.types";
import useSettings from "@store/settings";
import { IconCircleX } from "@tabler/icons-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import * as yup from "yup";
import andyDance from "@assets/andy-dance.png";
import andyWave from "@assets/andy-wave.png";
import SubmitButton from "@components/submit-button";

function Step1({
  setStep,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Hey there!</h1>
        <p>
          We're thrilled you're here! Elelem is your friendly assistant that
          dresses up your favorite models in fun personalities — just name them
          and give a prompt! Switching between your personalized pals is a
          breeze with keyboard shortcuts.
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

  const schema = yup.object().shape({
    ollamaUrl: yup
      .string()
      .test(
        "oneOf",
        "Provide either Ollama URL or OpenAI API Key.",
        function (value) {
          return this.parent.openAiApiKey ? true : !!value;
        }
      ),
    openAiApiKey: yup
      .string()
      .test(
        "oneOf",
        "Provide either OpenAI API Key or Ollama URL.",
        function (value) {
          return this.parent.ollamaUrl ? true : !!value;
        }
      ),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      openAiApiKey: settingsStore.openAiApiKey,
      ollamaUrl: settingsStore.ollamaUrl,
    },
  });

  const [error, setError] = useState<string>("");
  const onNext = async (data: yup.InferType<typeof schema>) => {
    setError("");
    let modelList: Model[] = [];

    if (data.openAiApiKey) {
      const models = await fetchOpenAiModels(data.openAiApiKey);
      if (models.length <= 0) {
        setError("Unable to get OpenAI models.");
        return;
      }
      modelList = modelList.concat(models);
    }

    if (data.ollamaUrl) {
      const models = await fetchOllamaModels(data.ollamaUrl);
      if (models.length <= 0) {
        setError("Unable to get Ollama models.");
        return;
      }
      modelList = modelList.concat(models);
    }

    await updateModelList(modelList);
    settingsStore.update({
      ollamaUrl: data.ollamaUrl,
      openAiApiKey: data.openAiApiKey,
    });
    setStep(3);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Prep Time</h1>
        <p>
          Before you get started, there's a quick step to complete: obtain an
          OpenAI API key or set up your own Ollama server. Make sure you have
          one of these ready before diving in! You'll need at least one of the
          OpenAI API or Ollama server, but feel free to provide both for extra
          options.
        </p>
        <form
          id="onboardStep2Form"
          className="text-start w-full"
          onSubmit={handleSubmit(onNext)}
        >
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">Ollama URL</legend>
            </div>
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
              <p className="fieldset-label">
                Learn more at https://ollama.com.
              </p>
            )}
          </fieldset>
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">OpenAI API Key</legend>
            </div>
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
  const modelList = useLiveQuery(async () => await db.model.toArray());
  const assistant = useLiveQuery(async () => await db.assistant.toArray());

  const schema = yup
    .object({
      name: yup.string().required("Name is a required field."),
      modelId: yup.string().required("Model is a required field."),
      prompt: yup.string(),
    })
    .required();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isLoading, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
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

  const [error, setError] = useState<string>("");
  const onNext = async (data: yup.InferType<typeof schema>) => {
    try {
      if (!settingsStore.activeAssistantId) {
        const assistantId = await db.assistant.add({
          name: data.name,
          modelId: data.modelId,
          prompt: data.prompt,
        });
        settingsStore.setActiveAssistant(assistantId);
      } else {
        await db.assistant.update(settingsStore.activeAssistantId, {
          name: data.name,
          prompt: data.prompt,
          modelId: data.modelId,
        });
      }
    } catch (_error) {
      setError("Unable to create assistant.");
      return;
    }
    setStep(4);
  };

  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">Designing Assistant</h1>
        <p>
          Let's create your assistant! Pick a name and a prompt, and don't
          forget to choose the right model to help keep costs down while getting
          the job done effectively.
        </p>
        <form
          id="onboardStep3Form"
          className="text-start"
          onSubmit={handleSubmit(onNext)}
        >
          <div className="grid grid-cols-2 gap-2">
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Model</legend>
              </div>
              <select
                className="select select-bordered w-full"
                {...register("modelId")}
              >
                {modelList?.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
              {!errors.modelId ? (
                <p className="fieldset-label">
                  Only chat completion models are supported.
                </p>
              ) : (
                <p className="fieldset-label text-error">
                  {errors.modelId.message}
                </p>
              )}
            </fieldset>
            <fieldset className="fieldset">
              <div>
                <legend className="fieldset-legend">Name (required)</legend>
              </div>
              <input
                type="text"
                className="input w-full"
                placeholder="Rephrase"
                {...register("name")}
              />

              {errors.name ? (
                <p className="fieldset-label text-error">
                  {errors.name.message}
                </p>
              ) : (
                <p className="fieldset-label">
                  Name will not be provided to model.
                </p>
              )}
            </fieldset>
          </div>
          <fieldset className="fieldset">
            <div>
              <legend className="fieldset-legend">Prompt (optional)</legend>
            </div>
            <textarea
              rows={2}
              className="textarea w-full !min-h-10"
              placeholder="e.g. Rephrase the following sentence, shorten it and make sure the fix any grammar mistake."
              {...register("prompt")}
            />
            <p className="fieldset-label">
              Leave this field empty if you want to use the model without a
              system prompt.
            </p>
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
  const settingsStore = useSettings();
  const navigation = useNavigate();
  return (
    <>
      <div className="w-full text-center space-y-6">
        <h1 className="text-2xl font-bold">At Your Service!</h1>
        <p>
          Congratulations, your assistant is ready to go! Use{" "}
          <kbd className="kbd">ALT</kbd> + number (e.g.{" "}
          <kbd className="kbd">ALT</kbd>
          <kbd className="kbd">1</kbd>) to choose your preferred one.
        </p>
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
          onClick={() => {
            settingsStore.setOnboardingComplete();
            navigation("/chat");
          }}
        >
          Let's go!
        </button>
      </div>
    </>
  );
}

export { Step1, Step2, Step3, Step4 };
