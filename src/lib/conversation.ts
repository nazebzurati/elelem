export const TIME_FORMAT = "DD MMM YYYY, hh:mm:ss a";

export const parseThinkingReply = (message: string): string => {
  const regex = /^<think>(.*?)<\/think>(.*)/s;
  const match = regex.exec(message);
  return match ? match[2].trim() : message;
};
