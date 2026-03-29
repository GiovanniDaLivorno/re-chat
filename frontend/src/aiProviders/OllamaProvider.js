// ollamaProvider for local development with Ollama's API
import { BaseProvider } from './BaseProvider';

export class OllamaProvider extends BaseProvider {
  baseUrl = 'http://localhost:11434';

  async listModels() {
    const res = await fetch(`${this.baseUrl}/api/tags`);
    if (!res.ok) throw new Error('Failed to fetch models');
    const data = await res.json();
    return data.models?.map((m) => m.name) || [];
  }

  async sendChat({ model, messages, temperature }) {
    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, stream: false, options: { temperature } }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data;
    // return data.message.content;
  }
}