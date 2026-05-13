import { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import { PROVIDERS } from './aiProviders';
import SettingsPanel from './SettingsPanel';
import './ChatWindow.css';

export default function ChatWindow() {
  const [providerName, setProviderName] = useState('Ollama'); // default
  const provider = PROVIDERS[providerName.toLowerCase()];
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [model, setModel] = useState('no model available');
  const [availableModels, setAvailableModels] = useState([]);
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {   // on mount check connection
    checkConnection();
  }, []);

  useEffect(() => {   // when user switches provider, need to refresh the models for that provider
    if (!provider) return;

    const fetchModels = async () => {
      try {
        setConnectionStatus('checking');
        const models = await provider.listModels();
        setAvailableModels(models);
        setModel(models[0] || '');
        setConnectionStatus('connected');
      } catch (err) {
        console.error('Connection error:', err);
        setAvailableModels([]);
        setModel('');
        setConnectionStatus('error');
      }
    };

    fetchModels();
  }, [provider]);

  const checkConnection = async () => {
    if (!provider) {
      setConnectionStatus('error');
      setAvailableModels([]);
      setModel('');
      return;
    }

    try {
      setConnectionStatus('checking');
      const models = await provider.listModels();
      if (!models) {
        setConnectionStatus('error');
        return;
      }
      setAvailableModels(models);
      if (models.length > 0) {
        setModel(models[0]);
      } else {
        setModel('');
      }
      setConnectionStatus('connected');
    } catch (error) {
      // console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };

  // TODO: add GUI button to clear chat and confirm before clearing
  const handleClearChat = () => {
    const confirmed = window.confirm('Clear the current conversation?');
    if (!confirmed) return;
    setMessages([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // send message to the API and handle response
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!model || model === '') {
      const errorMessage = {
        role: 'error',
        content: 'Error: no model selected or available.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Sending message to AI provider:', { model, message: input });

      const messagesToSend = systemPrompt.trim()
        ? [{ role: 'system', content: systemPrompt }, ...messages, userMessage]
        : [...messages, userMessage];

      const response = await provider.sendChat({
        model,
        messages: messagesToSend,
        temperature,
      });

      const content =
        response.message?.content ||
        response.choices?.[0]?.message?.content ||
        response.content ||
        response.text ||
        JSON.stringify(response);

      const assistantMessage = {
        role: 'assistant',
        content: typeof content === 'string' ? content : JSON.stringify(content),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: `Error: ${error.message}. Check console for details.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <ChatHeader
        availableProviders={['Ollama', 'DeepSeek', 'OpenAI']}
        provider={providerName}
        connectionStatus={connectionStatus}
        model={model}
        availableModels={availableModels}
        loading={loading}
        onModelChange={(e) => setModel(e.target.value)}
        onProviderChange={(e) => setProviderName(e.target.value)}
        // onRefresh={refreshModels} // was check connection, but we can add  a separate refresh button in the UI to refresh models without checking connection again
        onRefresh={checkConnection}
      />

      <SettingsPanel
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        temperature={temperature}
        setTemperature={setTemperature}
        disabled={loading}
      />

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>what can I do for you?</p>
            <small>ask anything and have fun!</small>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-role">{msg.role}</div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="message loading">
            <div className="message-role">assistant</div>
            <div className="message-content">
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
          autoFocus
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
