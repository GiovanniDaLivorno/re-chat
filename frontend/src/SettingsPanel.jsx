import { useState } from 'react'
import SystemPrompt from './SystemPrompt'
import Temperature from './Temperature'
import './SettingsPanel.css'

export default function SettingsPanel({
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  disabled
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="settings-panel">
      <div
        className="settings-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>⚙️ Settings</span>
        <span className={`arrow ${isOpen ? 'open' : ''}`}>▾</span>
      </div>

      {isOpen && (
        <div className="settings-body">
          <Temperature
            temperature={temperature}
            setTemperature={setTemperature}
            disabled={disabled}
          />

          <SystemPrompt
            systemPrompt={systemPrompt}
            setSystemPrompt={setSystemPrompt}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}