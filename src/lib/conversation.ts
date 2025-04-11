export const TIME_FORMAT = "hh:mm:ss A, DD/MM/YYYY";

export const parseThinkingReply = (message: string): string => {
  const regex = /^<think>(.*?)<\/think>(.*)/s;
  const match = regex.exec(message);
  return match ? match[2].trim() : message;
};
