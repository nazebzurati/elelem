import OpenAI from 'openai';

const fetchOpenAiModels = async (apiKey) => {
  try {
    const client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    const models = await client.models.list();
    return models.data.length > 0;
  } catch {
    return false;
  }
};

const fetchOllamaModels = async (url) => {
  try {
    const response = await fetch(`${url}/api/tags`);
    const responseData = await response.json();
    return responseData.models.map((m) => m.model).length > 0;
  } catch {
    return false;
  }
};

export { fetchOllamaModels, fetchOpenAiModels };
