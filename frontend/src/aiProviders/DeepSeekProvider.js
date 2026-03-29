// DeepseekProvider for DeepSeek API integration
// need to an API key in .env file of the backend as DEEPSEEK_API_KEY
import { BaseProvider } from './BaseProvider';

export class DeepSeekProvider extends BaseProvider {
  
  baseUrl = 'https://api.deepseek.com/v1';

  // optional: hardcode or fetch if API supports it
  async listModels() {
    return ['deepseek-chat'];
  }

  // For development, this sends the request to our backend which should proxy it to DeepSeek with the API key
  async sendChat({ model, messages, temperature }) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        temperature,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(`DeepSeek error: ${res.status} ${data.error || 'Unknown error'}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  }
}