"useclient";

import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
ChartJS.register(...registerables);

export const BarChart = ({
  data,
}: {
  data: { label: string; value: number }[];
}) => {
  return (
    <Bar
      data={{
        labels: data.map((item) => item.label),
        datasets: [
          {
            label: "Priority Score",
            data: data.map((item) => item.value),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
          },
        ],
      }}
      options={{
        scales: {
          y: { beginAtZero: true, max: 10 },
        },
      }}
    />
  );
};

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
