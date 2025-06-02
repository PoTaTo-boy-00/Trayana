"useclient";

import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

interface ChartData {
  label: string;
  value: number;
  trend?: string;
}

export const BarChart = ({ data }: { data: ChartData[] }) => (
  <Bar
    data={{
      labels: data.map((d) => d.label),
      datasets: [
        {
          label: "Priority Score",
          data: data.map((d) => d.value),
          backgroundColor: data.map((d) =>
            d.trend === "increasing"
              ? "#ef4444"
              : d.trend === "decreasing"
              ? "#10b981"
              : "#3b82f6"
          ),
        },
      ],
    }}
  />
);

export const PieChart = ({
  data,
}: {
  data: { label: string; value: number }[];
}) => {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <Pie
        data={{
          labels: data.map((item) => item.label),
          datasets: [
            {
              data: data.map((item) => item.value),
              backgroundColor: [
                "rgba(255, 99, 132, 0.7)", // red
                "rgba(54, 162, 235, 0.7)", // blue
                "rgba(255, 206, 86, 0.7)", // yellow
              ],
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#e5e7eb", // light text for dark mode
              },
            },
          },
        }}
        height={300}
      />
    </div>
  );
};

interface Prediction {
  type: string;
  currentAmount: number;
  depletionTime: Date;
  depletionProbability: number;
}

export const PredictionTimeline = ({ data }: { data: any[] }) => {
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
};
