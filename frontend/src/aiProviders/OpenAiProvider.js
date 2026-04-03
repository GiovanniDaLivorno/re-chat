import { BaseProvider } from './BaseProvider';

export class OpenAiProvider extends BaseProvider {
  baseUrl = '/api'; // points to your backend

  /**
   * returns available models
   */
  async listModels() {
    const res = await fetch(`${this.baseUrl}/models`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch models: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.models || [];
  }

  /**
   * Send chat messages to backend, backend proxies them to OpenAI
   * @param {Object} params
   * @param {string} params.model - model name
   * @param {Array} params.messages - array of messages { role, content }
   * @param {number} params.temperature - optional temperature
   */
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

    // Return normalized response
    return data;
    // Or if your UI expects a string:
    // return data.message?.content;
  }
}