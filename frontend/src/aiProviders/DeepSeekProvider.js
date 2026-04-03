// DeepseekProvider for DeepSeek API integration
// need to an API key in .env file of the backend as DEEPSEEK_API_KEY
import { BaseProvider } from './BaseProvider';

export class DeepSeekProvider extends BaseProvider {
  baseUrl = '/api';

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
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Backend error: ${res.status} ${text}`);
    }

    const data = await res.json();

    // Normalize response shape (important!)
    return data;
    // or if your UI expects string:
    // return data.message?.content;
  }
}