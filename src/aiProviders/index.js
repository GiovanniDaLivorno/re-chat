// aiProviders/index.js
import { OllamaProvider } from './ollamaProvider';
import { DeepSeekProvider } from './deepseekProvider';

export const PROVIDERS = {
  ollama: new OllamaProvider(),
  deepseek: new DeepSeekProvider(),
};