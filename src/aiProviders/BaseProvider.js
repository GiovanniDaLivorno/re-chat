// aiProviders/baseProvider.js
export class BaseProvider {
  async listModels() {
    throw new Error('Not implemented');
  }

  async sendChat({ model, messages, temperature }) {
    throw new Error('Not implemented');
  }
}