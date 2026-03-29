import './ChatHeader.css';  

const ChatHeader = ({
  connectionStatus,
  model,
  availableModels,
  loading,
  onModelChange,
  onRefresh,
}) => {
  return (
    <div className="chat-header">
      <div className="header-left">
        <h2>re-chat</h2>
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
          onChange={onModelChange}
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
        <button onClick={onRefresh} disabled={loading} className="refresh-btn">
          ↻
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;