// aiProviders/index.js
import { OllamaProvider } from './OllamaProvider';
import { DeepSeekProvider } from './DeepSeekProvider';

export const PROVIDERS = {
  ollama: new OllamaProvider(),
  deepseek: new DeepSeekProvider(),
};