import { BaseProvider } from './BaseProvider';

// ollamaProvider for local development with Ollama's API
export class OllamaProvider extends BaseProvider {
  baseUrl = '/api'; // backend base URL

  async listModels() {
    const res = await fetch(`${this.baseUrl}/models`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch models: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.models || [];
  }

  async sendChat({ model, messages, temperature }) {
    const res = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data;
  }
}