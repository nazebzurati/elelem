export interface Provider {
  id: number;
  baseURL?: string;
  apiKey?: string;
}

export interface ProviderWithCount extends Provider {
  modelCount: number;
}
