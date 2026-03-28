// DeepseekProvider for DeepSeek API integration
// need to an API key in .env file as REACT_APP_DEEPSEEK_API_KEY
import { BaseProvider } from './baseProvider';

export class DeepSeekProvider extends BaseProvider {
  baseUrl = 'https://api.deepseek.com/v1';
  apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;

  async listModels() {
    // optional: hardcode or fetch if API supports it
    return ['deepseek-chat'];
  }

  async sendChat({ model, messages, temperature }) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`DeepSeek error: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
}