import db from "./config";

export interface Prompt {
  id: number;
  title: string;
  prompt: string;
}

export const getPrompt = async (
  promptId: number
): Promise<Prompt | undefined> => {
  return await db.prompt.get(promptId);
};

export const getPromptList = async (): Promise<Prompt[]> => {
  return await db.prompt.toArray();
};
