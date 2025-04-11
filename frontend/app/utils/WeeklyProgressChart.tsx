import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axiosInstance from '../utils/apiHelper'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
  Tooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip);

interface IntakeData {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const WeeklyProgressChart: React.FC = () => {
  const [weeklyData, setWeeklyData] = useState<IntakeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasValidData, setHasValidData] = useState<boolean>(false);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await axiosInstance.get('/user/weekly-intake'); 
        const data = response.data;

       
        const isValid = data.some((entry: IntakeData) =>
          !isNaN(entry.calories) && !isNaN(entry.protein) &&
          !isNaN(entry.carbs) && !isNaN(entry.fat)
        );

        setHasValidData(isValid);
        setWeeklyData(data);
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, []);

  const chartData = {
    labels: weeklyData.map((entry) => entry.day),
    datasets: [
      {
        label: 'Calories',
        data: weeklyData.map((entry) => Number(entry.calories) || 0),
        borderColor: '#FF6384',
        tension: 0.4
      },
      {
        label: 'Protein (g)',
        data: weeklyData.map((entry) => Number(entry.protein) || 0),
        borderColor: '#36A2EB',
        tension: 0.4
      },
      {
        label: 'Carbs (g)',
        data: weeklyData.map((entry) => Number(entry.carbs) || 0),
        borderColor: '#FFCE56',
        tension: 0.4
      },
      {
        label: 'Fat (g)',
        data: weeklyData.map((entry) => Number(entry.fat) || 0),
        borderColor: '#4BC0C0',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ textAlign: 'center' }}>Your Weekly Diet Progress</h2>

      {loading ? (
        <p>Loading...</p>
      ) : !hasValidData ? (
        <p>No valid data to display. Please log meals to see progress.</p>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
};

export default WeeklyProgressChart;
