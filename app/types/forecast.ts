// types/forecasting.ts
export interface ForecastingInput {
  // For time series forecasting, we typically need:
  forecast_horizon: number; // How many days/hours ahead to predict
  context_window?: number; // How much historical data to consider
  confidence_level?: number; // For prediction intervals
}

export interface TimeSeriesPoint {
  timestamp: string; // ISO date string
  value: number;
  upper_bound?: number;
  lower_bound?: number;
  confidence?: number;
}

export interface ForecastingResponse {
  predictions: TimeSeriesPoint[];
  model: string;
  modelDisplayName: string;
  metadata: {
    forecast_horizon: number;
    generated_at: string;
    confidence_level: number;
  };
}

export interface HistoricalDataPoint {
  date: string;
  trip_count: number;
  avg_fare?: number;
  total_revenue?: number;
  day_of_week: number;
  month: number;
}

export interface ForecastingError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

// Validation for forecasting inputs
export const forecastingInputSchema = {
  forecast_horizon: { min: 1, max: 365, required: true },
  context_window: { min: 7, max: 1000, required: false },
  confidence_level: { min: 0.5, max: 0.99, required: false },
};

export type ForecastValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Chart data structure for visualization
export interface ChartDataPoint {
  date: string;
  historical?: number;
  predicted?: number;
  upperBound?: number;
  lowerBound?: number;
  type: "historical" | "predicted";
}
