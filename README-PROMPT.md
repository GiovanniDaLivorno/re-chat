## ollama

send message to ollama with POST at http://localhost:11434/api/chat
POST payload
```
{
  "model": "qwen2.5-coder:0.5b",  // model name
  "messages": [
    <!-- system prompt -->
    {
      "role": "system",
      "content": "You are a helpful assistant. yada yada ..."
    },
    <!-- user prompt -->
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    <!-- previous messages exchange below -->
    {
      "role": "assistant",
      "content": "I'm doing well, thank you! How can I help?"
    },
    {
      "role": "user",
      "content": "What's the weather like?"
    }
  ],
  "stream": false,  // Set to true for streaming responses
  "options": {
    "temperature": 0.7  // Controls creativity (0.0 = precise, 2.0 = creative)
  }
}
```

## openai

send message to OpenAI with POST at https://api.openai.com/v1/chat/completions
Requires an API key in the Authorization header: "Authorization: Bearer YOUR_API_KEY"

POST payload
```
{
  "model": "gpt-4", // model name 
  "messages": [
    <!-- system prompt -->
    {
      "role": "system",
      "content": "You are a helpful assistant. yada yada ..."
    },
    <!-- user prompt -->
    {
      "role": "user",
      "content": "Hello, how are you?"
    },
    <!-- previous messages exchange below -->
    {
      "role": "assistant",
      "content": "I'm doing well, thank you! How can I help?"
    },
    {
      "role": "user",
      "content": "What's the weather like?"
    }
  ],
  "temperature": 0.7, // Controls creativity (0.0 = precise, 2.0 = creative)
  "stream": true, // Set to true for streaming responses
  "max_tokens": 150 // Optional: Maximum number of tokens to generate
}
```