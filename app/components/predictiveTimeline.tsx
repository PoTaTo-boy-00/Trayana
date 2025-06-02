// components/charts/PredictionTimeline.tsx
"use client";

import { Line } from "react-chartjs-2";

export default function PredictionTimeline({ data }: { data: any[] }) {
  const chartData = {
    labels: data.map((p) => `Hour ${p.hour}`),
    datasets: Object.keys(data[0]?.resources || {}).map((type) => ({
      label: type,
      data: data.map((p) => p.resources[type]?.remaining || 0),
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.4,
    })),
  };

  return <Line data={chartData} options={{ responsive: true }} />;
}
