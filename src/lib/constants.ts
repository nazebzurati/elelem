const OPENAI_CHAT_COMPLETION_MODELS = [
  "chatgpt-4o-latest",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-4",
  "gpt-4-0125-preview",
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-turbo-preview",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
];

const OPENAI_REASONING_MODELS = [
  "o1-mini",
  "o1-mini-2024-09-12",
  "o1-preview",
  "o1-preview-2024-09-12",
];

export const OPENAI_SUPPORTED_MODELS = [
  ...OPENAI_CHAT_COMPLETION_MODELS,
  ...OPENAI_REASONING_MODELS,
];
