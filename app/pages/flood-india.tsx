// pages/flood-india.tsx
import { useState } from "react";

export default function IndiaFloodPage() {
  const [location, setLocation] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [riverLevel, setRiverLevel] = useState("");
  const [soil, setSoil] = useState("");
  const [prediction, setPrediction] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const res = await fetch("/api/predictFloodIndia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        rainfall,
        riverLevel,
        soilMoisture: soil,
      }),
    });
    const data = await res.json();
    setPrediction(data.prediction);
  }

  return (
    <div>
      <h1>India Flood Prediction</h1>
      <form onSubmit={handleSubmit}>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="">Select State</option>
          <option value="Kerala">Kerala</option>
          <option value="Assam">Assam</option>
          <option value="Bihar">Bihar</option>
          
        </select>
        <input
          placeholder="Rainfall (mm)"
          value={rainfall}
          onChange={(e) => setRainfall(e.target.value)}
          type="number"
        />
        <input
          placeholder="River Level (m)"
          value={riverLevel}
          onChange={(e) => setRiverLevel(e.target.value)}
          type="number"
        />
        <input
          placeholder="Soil Moisture (%)"
          value={soil}
          onChange={(e) => setSoil(e.target.value)}
          type="number"
        />
        <button type="submit">Predict</button>
      </form>
      {prediction && <div className="prediction-result">{prediction}</div>}
    </div>
  );
}
