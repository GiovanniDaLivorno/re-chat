import { useState, useRef, useEffect } from 'react'
import './ChatWindow.css'

// ChatWindow component is the main UI for the chat application
// ollama need model is selected before messages.
// API endpoint: http://localhost:11434/api/chat
// openAI need authentication and model specification in the request body
// API endpoint: https://api.openai.com/v1/chat/completions 

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('no model available')
  const [availableModels, setAvailableModels] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
  const [temperature, setTemperature] = useState(0.7)
  const messagesEndRef = useRef(null)

  // on mount check connection
  useEffect(() => {
    checkConnection()   
  }, [])

  // check the connection to Ollama and fetch available models
  // then update connection status and available model list
  const checkConnection = async () => {
    try {
      setConnectionStatus('checking')
      const response = await fetch('http://localhost:11434/api/tags')
      if (!response.ok) {
        setConnectionStatus('error')
        return
      }
      const data = await response.json()
      const models = data.models?.map((m) => m.name) || []
      setAvailableModels(models)
      // choose a default model if we don't already have one
      if (models.length > 0) {
        setModel(models[0])
      } else {
        // if no models available clear any previous selection
        setModel('')
      }
      setConnectionStatus('connected')
    } catch (error) {
      console.error('Connection error:', error)
      setConnectionStatus('error')
    }
  }

  // scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // send a message to Ollama and handle the response
  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // make sure a model is selected before sending
    if (!model || model === 'no model available') {
      const errorMessage = {
        role: 'error',
        content: 'Error: no model selected. Please choose a model from the dropdown before sending.',
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage = { role: 'user', content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // messages are sent with a POST request to /api/chat endpoint
    // if system prompt is not null or empty, it is added as 1st message with role "system"
    try {
      console.log('Sending message to Ollama:', { model, message: input })
      const messagesToSend = systemPrompt.trim() ? [{ role: 'system', content: systemPrompt }, ...messages, userMessage] : [...messages, userMessage]
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
            temperature: temperature
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Ollama API error:', { status: response.status, body: errorText })
        throw new Error(
          `HTTP error! status: ${response.status}. Make sure Ollama is running and the model "${model}" is available.`
        )
      }

      const data = await response.json()
      const assistantMessage = {
        role: 'assistant',
        content: data.message.content,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        role: 'error',
        content: `Error: ${error.message}. Check console for details.`,
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="header-left">
          <h2>chat support</h2>
          <div className={`connection-status ${connectionStatus}`}>
            <span className="status-dot"></span>
            {connectionStatus === 'checking' && 'Connecting...'}
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'error' && 'Not Connected'}
          </div>
        </div>
        <div className="model-selector">
          <label htmlFor="model">Model: </label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={loading || connectionStatus !== 'connected' || availableModels.length === 0}
          >
            {connectionStatus === 'connected' && availableModels.length > 0 ? (
              availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {connectionStatus === 'connected' ? 'no models available' : 'loading...'}
              </option>
            )}
          </select>
          <button onClick={checkConnection} disabled={loading} className="refresh-btn">
            ↻
          </button>
        </div>
      </div>

      <div className="temperature-control">
        <label htmlFor="temperature">Temperature: {temperature}</label>
        <input
          type="range"
          id="temperature"
          min="0"
          max="2"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          disabled={loading}
        />
        <div className="temperature-labels">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="system-prompt">
        <label htmlFor="systemPrompt">System Prompt:</label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter system prompt..."
          disabled={loading}
          rows={3}
        />
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>what can I help you with?</p>
            <small>services catalogue is available at ...</small>
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
  )
}
