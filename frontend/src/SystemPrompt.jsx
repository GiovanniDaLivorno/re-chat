import './SystemPrompt.css'

export default function SystemPrompt({
  systemPrompt,
  setSystemPrompt,
  disabled
}) {
  return (
    <div className="system-prompt">
      <label htmlFor="systemPrompt">System Prompt</label>

      <textarea
        id="systemPrompt"
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Enter system prompt..."
        disabled={disabled}
        rows={3}
      />
    </div>
  )
}