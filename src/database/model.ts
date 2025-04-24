import db from "./config";
import { Provider } from "./provider";

export interface Model {
  id: string;
  providerId: number;
}

export interface ModelWithDetails extends Model {
  provider?: Provider;
}

export const getModel = async (
  modelId: string,
): Promise<ModelWithDetails | undefined> => {
  const model = await db.model.get(modelId);
  if (!model) return undefined;
  return { ...model, provider: await db.provider.get(model.providerId) };
};

export const getModelList = async (): Promise<ModelWithDetails[]> => {
  const modelList = await db.model.toArray();
  return await Promise.all(
    modelList.map(async (model) => {
      return { ...model, provider: await db.provider.get(model.providerId) };
    }),
  );
};
