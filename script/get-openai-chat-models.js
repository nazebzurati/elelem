const { default: OpenAI } = require('openai');

// dotenv -e .env node script/get-openai-chat-models.js

(async () => {
  // connect to openai
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // get models
  const models = await client.models.list();
  const replies = [];
  for (const model of models.data) {
    try {
      const completions = await client.chat.completions.create({
        model: model.id,
        messages: [{ role: 'user', content: 'hello' }]
      });
      const reply = completions.choices[0].message[0].content;
      replies.push({ id: model.id, input: 'hello', reply });
    } catch (error) {
      replies.push({ id: model.id, input: 'hello', error: error.message });
    }
  }

  // print out
  console.log(JSON.stringify(replies.filter((r) => r.reply).map((r) => r.id)));
})();
