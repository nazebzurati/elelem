export const TIME_FORMAT = 'hh:mm:ss A, DD/MM/YYYY';

export const getReply = (message) => {
  const match = message.match(/^<think>(.*?)<\/think>(.*)/s);
  return match ? match[2].trim() : '';
};
