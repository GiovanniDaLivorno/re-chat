import { useState, useRef, useEffect } from 'react'
import './ChatWindow.css'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [model, setModel] = useState('no model available')
  const [availableModels, setAvailableModels] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('checking')
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

    // message are sent with a POST request to /api/chat endpoint
    try {
      console.log('Sending message to Ollama:', { model, message: input })
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [...messages, userMessage],
          stream: false,
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
          <h2>CaaS services assistant</h2>
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

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>what service do you want to use?</p>
            <small>a service catalog is available at ...</small>
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
