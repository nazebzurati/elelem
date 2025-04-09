import OpenAI from "openai";
import progress from "cli-progress";

// This task is to get OpenAI model that not support chat completions
//
// Command:
//      deno run --env-file=.env script:check-openai-model

(async () => {
  // connect to openAI
  const client = new OpenAI();

  // get model list
  const chatCompletionUnsupportedModelList: string[] = [];
  const modelList = await client.models.list();
  const bar = new progress.SingleBar({}, progress.Presets.shades_classic);

  // test each model
  bar.start(modelList.data.length, 0);
  for (const model of modelList.data) {
    bar.increment();
    try {
      await client.chat.completions.create({
        model: model.id,
        messages: [{ role: "user", content: "hello" }],
      });
    } catch (error) {
      chatCompletionUnsupportedModelList.push(model.id);
    }
  }

  // show result
  bar.stop();
  console.log(
    "Model list that not support chat completion:\n-",
    chatCompletionUnsupportedModelList.join("\n- ")
  );
})();
