import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WingfoilSession } from '../../types';

interface ProgressChartProps {
  sessions: WingfoilSession[];
  metric: 'duration' | 'distance' | 'speed' | 'runs';
  title: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ sessions, metric, title }) => {
  const sortedSessions = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-20); // Last 20 sessions

  const data = sortedSessions.map(session => {
    let value: number;
    let bestValue: number;

    switch (metric) {
      case 'duration':
        value = session.stats.averageRunDuration;
        bestValue = session.stats.longestRunDuration;
        break;
      case 'distance':
        value = session.stats.averageRunDistance;
        bestValue = session.stats.longestRunDistance;
        break;
      case 'speed':
        value = session.stats.bestAverageSpeed;
        bestValue = session.stats.bestMaxSpeed;
        break;
      case 'runs':
        value = session.stats.numberOfRuns;
        bestValue = session.stats.numberOfRuns;
        break;
      default:
        value = 0;
        bestValue = 0;
    }

    return {
      date: format(new Date(session.date), 'dd/MM', { locale: fr }),
      fullDate: format(new Date(session.date), 'EEEE d MMMM', { locale: fr }),
      value: Math.round(value * 10) / 10,
      bestValue: Math.round(bestValue * 10) / 10,
      sessionName: session.name,
    };
  });

  const getUnit = () => {
    switch (metric) {
      case 'duration':
        return 's';
      case 'distance':
        return 'm';
      case 'speed':
        return 'km/h';
      case 'runs':
        return '';
      default:
        return '';
    }
  };

  const getLabels = () => {
    switch (metric) {
      case 'duration':
        return { avg: 'Durée moyenne', best: 'Meilleure durée' };
      case 'distance':
        return { avg: 'Distance moyenne', best: 'Meilleure distance' };
      case 'speed':
        return { avg: 'Vitesse moyenne', best: 'Vitesse max' };
      case 'runs':
        return { avg: 'Nombre de runs', best: '' };
      default:
        return { avg: '', best: '' };
    }
  };

  const labels = getLabels();
  const unit = getUnit();

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Pas assez de données pour afficher le graphique
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              unit={unit}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value, name) => [
                `${value}${unit}`,
                name === 'value' ? labels.avg : labels.best,
              ]}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const p = payload[0].payload as { fullDate: string; sessionName: string };
                  return `${p.fullDate}\n${p.sessionName}`;
                }
                return '';
              }}
            />
            <Legend
              formatter={(value) => (value === 'value' ? labels.avg : labels.best)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#0d9488"
              strokeWidth={2}
              dot={{ fill: '#0d9488', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#0d9488' }}
            />
            {metric !== 'runs' && (
              <Line
                type="monotone"
                dataKey="bestValue"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#60a5fa', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5, fill: '#60a5fa' }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
