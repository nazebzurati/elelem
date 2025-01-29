import OpenAI from 'openai';
import { db } from './database';

const OPENAI_CHAT_COMPLETION_MODELS = [
  'chatgpt-4o-latest',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0125',
  'gpt-3.5-turbo-1106',
  'gpt-4',
  'gpt-4-0125-preview',
  'gpt-4-0613',
  'gpt-4-1106-preview',
  'gpt-4-turbo',
  'gpt-4-turbo-2024-04-09',
  'gpt-4-turbo-preview',
  'gpt-4o',
  'gpt-4o-2024-05-13',
  'gpt-4o-2024-08-06',
  'gpt-4o-2024-11-20',
  'gpt-4o-mini',
  'gpt-4o-mini-2024-07-18',
  'o1-mini',
  'o1-mini-2024-09-12',
  'o1-preview',
  'o1-preview-2024-09-12'
];

const fetchOpenAiModels = async (apiKey) => {
  try {
    const client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });
    const models = await client.models.list();
    return models.data.filter((m) => OPENAI_CHAT_COMPLETION_MODELS.includes(m.id)).map((m) => m.id);
  } catch {
    return [];
  }
};

const fetchOllamaModels = async (url) => {
  try {
    const response = await fetch(`${url}/api/tags`);
    const responseData = await response.json();
    return responseData.models.map((m) => m.model);
  } catch {
    return [];
  }
};

const updateModelList = async (existingList, newList) => {
  const modelToBeAdded = newList.filter((model) => !existingList.includes(model));
  for (const model of modelToBeAdded) {
    await db.model.add({ id: model });
  }

  const modelToBeRemoved = existingList.filter((model) => !newList.includes(model));
  for (const model of modelToBeRemoved) {
    await db.model.remove({ id: model });
  }
};

export { fetchOllamaModels, fetchOpenAiModels, updateModelList };
