"use client";

import { useState } from "react";
// import { type } from "../../components/ui/carousel";

export default function FloodPredictorForm() {
  const [rainfall, setRainfall] = useState("");
  const [riverLevel, setRiverLevel] = useState("");
  const [soilSaturation, setSoilSaturation] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/predictions/predict-flood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rainfall: parseFloat(rainfall),
          riverLevel: parseFloat(riverLevel),
          soilSaturation: parseFloat(soilSaturation),
        }),
      });

      const data = await res.json();
      setResult(data.prediction || "No prediction received");
    } catch (error) {
      setResult("Error predicting flood");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Flood Prediction (India)</h1>

      <input
        type="number"
        placeholder="Rainfall (mm)"
        value={rainfall}
        onChange={(e) => setRainfall(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="River Level (m)"
        value={riverLevel}
        onChange={(e) => setRiverLevel(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Soil Saturation (0 to 1)"
        value={soilSaturation}
        onChange={(e) => setSoilSaturation(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Location"
        value={""} // Placeholder for location input
        onChange={(e) => {}}
        className="w-full border p-2 rounded"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded"
        disabled={loading}
      >
        {loading ? "Predicting..." : "Predict Flood Risk"}
      </button>

      {result && (
        <div className="bg-gray-100 p-2 rounded text-center mt-4">
          <p>
            <strong>Prediction:</strong> {result}
          </p>
        </div>
      )}
    </div>
  );
}
