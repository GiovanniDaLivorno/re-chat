import './Temperature.css'

export default function Temperature({
  temperature,
  setTemperature,
  disabled
}) {
  return (
    <div className="temperature-control">
      <label htmlFor="temperature">
        Temperature: {temperature.toFixed(1)}
      </label>

      <input
        type="range"
        id="temperature"
        min="0"
        max="2"
        step="0.1"
        value={temperature}
        onChange={(e) => setTemperature(parseFloat(e.target.value))}
        disabled={disabled}
      />

      <div className="temperature-labels">
        <span>Precise</span>
        <span>Creative</span>
      </div>
    </div>
  )
}