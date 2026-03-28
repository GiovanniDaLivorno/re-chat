import { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';
import SettingsPanel from './SettingsPanel';
import ChatHeader from './ChatHeader';  // <-- new import

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('no model available');
  const [availableModels, setAvailableModels] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const messagesEndRef = useRef(null);

  // const [providerName, setProviderName] = useState('ollama');
  // const provider = PROVIDERS[providerName];
  
  // on mount check connection
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        setConnectionStatus('error');
        return;
      }
      const data = await response.json();
      const models = data.models?.map((m) => m.name) || [];
      setAvailableModels(models);
      if (models.length > 0) {
        setModel(models[0]);
      } else {
        setModel('');
      }
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    }
  };


// const checkConnection = async () => {
//   try {
//     setConnectionStatus('checking');
//     const models = await provider.listModels();

//     setAvailableModels(models);
//     setModel(models[0] || '');
//     setConnectionStatus('connected');
//   } catch (err) {
//     console.error(err);
//     setConnectionStatus('error');
//   }
// };




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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!model || model === 'no model available') {
      const errorMessage = {
        role: 'error',
        content: 'Error: no model selected. Please choose a model from the dropdown before sending.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      console.log('Sending message to Ollama:', { model, message: input });
      const messagesToSend = systemPrompt.trim()
        ? [{ role: 'system', content: systemPrompt }, ...messages, userMessage]
        : [...messages, userMessage];
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messagesToSend,
          stream: false,
          options: {
            temperature: temperature,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Ollama API error:', { status: response.status, body: errorText });
        throw new Error(
          `HTTP error! status: ${response.status}. Make sure Ollama is running and the model "${model}" is available.`
        );
      }

      const data = await response.json();
      const assistantMessage = {
        role: 'assistant',
        content: data.message.content,
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
        connectionStatus={connectionStatus}
        model={model}
        availableModels={availableModels}
        loading={loading}
        onModelChange={(e) => setModel(e.target.value)}
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