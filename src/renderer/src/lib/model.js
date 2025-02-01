import OpenAI from 'openai';

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

export const fetchOpenAiModels = async (apiKey) => {
  try {
    const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const models = await client.models.list();
    return models.data
      .filter((m) => OPENAI_CHAT_COMPLETION_MODELS.includes(m.id))
      .map((m) => ({ id: m.id, baseUrl: undefined }));
  } catch {
    return [];
  }
};

export const fetchOllamaModels = async (url) => {
  try {
    const response = await fetch(`${url}/api/tags`);
    const responseData = await response.json();
    return responseData.models.map((m) => ({ id: m.model, baseUrl: `${url}/v1/` }));
  } catch {
    return [];
  }
};

export const prepareMessages = ({ assistant, chats, input }) => {
  return [
    {
      role: 'system',
      content: `You're an assistant named '${assistant.name}'`
    },
    { role: 'system', content: assistant.prompt },
    ...(chats || []).flatMap((chat) => [
      { role: 'user', content: chat.user },
      { role: 'assistant', content: chat.assistant }
    ]),
    { role: 'user', content: input }
  ];
};
