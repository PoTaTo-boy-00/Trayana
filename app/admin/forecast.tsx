// pages/index.tsx
import { useState, useEffect } from "react";
import {
  ForecastingInput,
  ForecastingResponse,
  TimeSeriesPoint,
  ChartDataPoint,
} from "../types/forecast";

interface FormData {
  forecast_horizon: string;
  confidence_level: string;
}

export default function ForecastingHome() {
  const [formData, setFormData] = useState<FormData>({
    forecast_horizon: "30",
    confidence_level: "0.95",
  });

  const [forecast, setForecast] = useState<ForecastingResponse | null>(null);
  const [historical, setHistorical] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Load historical data on component mount
  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    try {
      const response = await fetch("/api/historical?days=60");
      if (response.ok) {
        const data = await response.json();
        setHistorical(data);
      }
    } catch (err) {
      console.error("Failed to load historical data:", err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setForecast(null);

    try {
      const input: ForecastingInput = {
        forecast_horizon: parseInt(formData.forecast_horizon),
        confidence_level: parseFloat(formData.confidence_level),
      };

      const response = await fetch("/api/forecast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Forecasting failed");
      }

      setForecast(data);
      prepareChartData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (forecastData: ForecastingResponse) => {
    const combined: ChartDataPoint[] = [];

    // Add historical data
    historical.slice(-30).forEach((point) => {
      combined.push({
        date: point.date,
        historical: point.trip_count,
        type: "historical",
      });
    });

    // Add forecast data
    forecastData.predictions.forEach((point: TimeSeriesPoint) => {
      combined.push({
        date: point.timestamp,
        predicted: point.value,
        upperBound: point.upper_bound,
        lowerBound: point.lower_bound,
        type: "predicted",
      });
    });

    setChartData(combined);
  };

  const renderSimpleChart = () => {
    if (chartData.length === 0) return null;

    const maxValue = Math.max(
      ...chartData.map((d) =>
        Math.max(d.historical || 0, d.predicted || 0, d.upperBound || 0)
      )
    );

    return (
      <div style={{ marginTop: "20px" }}>
        <h3>Forecast Visualization</h3>
        <div
          style={{
            display: "flex",
            height: "200px",
            border: "1px solid #ccc",
            padding: "10px",
            alignItems: "flex-end",
            gap: "2px",
          }}
        >
          {chartData.slice(-60).map((point, index) => {
            const historicalHeight = point.historical
              ? (point.historical / maxValue) * 180
              : 0;
            const predictedHeight = point.predicted
              ? (point.predicted / maxValue) * 180
              : 0;
            const upperHeight = point.upperBound
              ? (point.upperBound / maxValue) * 180
              : 0;
            const lowerHeight = point.lowerBound
              ? (point.lowerBound / maxValue) * 180
              : 0;

            return (
              <div
                key={index}
                style={{ position: "relative", minWidth: "8px" }}
              >
                {point.historical && (
                  <div
                    style={{
                      height: `${historicalHeight}px`,
                      backgroundColor: "#007bff",
                      width: "8px",
                    }}
                    title={`${point.date}: ${point.historical} trips`}
                  />
                )}
                {point.predicted && (
                  <>
                    <div
                      style={{
                        height: `${predictedHeight}px`,
                        backgroundColor: "#28a745",
                        width: "8px",
                        position: point.historical ? "absolute" : "relative",
                        bottom: 0,
                      }}
                      title={`${point.date}: ${point.predicted} trips (predicted)`}
                    />
                    {point.upperBound && point.lowerBound && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: `${lowerHeight}px`,
                          height: `${upperHeight - lowerHeight}px`,
                          width: "8px",
                          backgroundColor: "rgba(40, 167, 69, 0.2)",
                          border: "1px solid rgba(40, 167, 69, 0.3)",
                        }}
                        title={`Confidence interval: ${point.lowerBound} - ${point.upperBound}`}
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: "10px", fontSize: "12px" }}>
          <span style={{ color: "#007bff" }}>■</span> Historical &nbsp;
          <span style={{ color: "#28a745" }}>■</span> Forecast &nbsp;
          <span style={{ color: "rgba(40, 167, 69, 0.5)" }}>■</span> Confidence
          Interval
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>Taxi Demand Forecasting - Vertex AI</h1>
      <p>Forecast future taxi trip volume using time series analysis</p>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label>Forecast Horizon (days):</label>
            <input
              type="number"
              name="forecast_horizon"
              value={formData.forecast_horizon}
              onChange={handleInputChange}
              min="1"
              max="365"
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
            <small style={{ color: "#666" }}>
              How many days ahead to predict (1-365)
            </small>
          </div>

          <div>
            <label>Confidence Level:</label>
            <select
              name="confidence_level"
              value={formData.confidence_level}
              onChange={handleInputChange}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            >
              <option value="0.80">80%</option>
              <option value="0.90">90%</option>
              <option value="0.95">95%</option>
              <option value="0.99">99%</option>
            </select>
            <small style={{ color: "#666" }}>
              Prediction interval confidence
            </small>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "Generating Forecast..." : "Generate Forecast"}
        </button>
      </form>

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "5px",
            marginBottom: "15px",
            border: "1px solid #f5c6cb",
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {forecast && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#d4edda",
            color: "#155724",
            borderRadius: "5px",
            border: "1px solid #c3e6cb",
            marginBottom: "20px",
          }}
        >
          <h3>Forecast Generated Successfully!</h3>
          <p>
            <strong>Forecast Period:</strong>{" "}
            {forecast.metadata.forecast_horizon} days
          </p>
          <p>
            <strong>Confidence Level:</strong>{" "}
            {forecast.metadata.confidence_level * 100}%
          </p>
          <p>
            <strong>Total Predictions:</strong> {forecast.predictions.length}
          </p>
          <p>
            <strong>Average Predicted Trips:</strong>{" "}
            {Math.round(
              forecast.predictions.reduce(
                (sum: any, p: { value: any }) => sum + p.value,
                0
              ) / forecast.predictions.length
            )}
          </p>
        </div>
      )}

      {renderSimpleChart()}

      {forecast && (
        <div style={{ marginTop: "20px" }}>
          <h3>Detailed Forecast Data</h3>
          <div
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead
                style={{
                  backgroundColor: "#f8f9fa",
                  position: "sticky",
                  top: 0,
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "left",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Predicted Trips
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Lower Bound
                  </th>
                  <th
                    style={{
                      padding: "8px",
                      textAlign: "right",
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    Upper Bound
                  </th>
                </tr>
              </thead>
              <tbody>
                {forecast.predictions
                  .slice(0, 30)
                  .map((point: TimeSeriesPoint, index: number) => (
                    <tr
                      key={index}
                      style={{ borderBottom: "1px solid #f8f9fa" }}
                    >
                      <td style={{ padding: "8px" }}>{point.timestamp}</td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        {Math.round(point.value)}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        {point.lower_bound
                          ? Math.round(point.lower_bound)
                          : "-"}
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        {point.upper_bound
                          ? Math.round(point.upper_bound)
                          : "-"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
