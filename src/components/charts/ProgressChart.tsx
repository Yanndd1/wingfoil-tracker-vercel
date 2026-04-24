import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import { format } from 'date-fns';
import { fr, enUS, nl } from 'date-fns/locale';
import { WingfoilSession } from '../../types';
import { useTranslation } from '../../context/LanguageContext';

interface ProgressChartProps {
  sessions: WingfoilSession[];
  metric: 'duration' | 'distance' | 'speed' | 'runs';
  title: string;
}

/**
 * v2: renders the progression of the chosen metric across the **entire**
 * history (no more `.slice(-20)`), starting from the very first session
 * fetched from Strava. Only the "best" series is plotted — the per-session
 * average was removed to keep the chart focused on personal records.
 *
 * A horizontal `<Brush>` keeps the chart readable when there are many
 * sessions: the visible window defaults to the latest ~30 sessions, the
 * user can drag to explore older periods.
 */
const ProgressChart: React.FC<ProgressChartProps> = ({ sessions, metric, title }) => {
  const { t, language } = useTranslation();
  const locale = language === 'fr' ? fr : language === 'nl' ? nl : enUS;

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = sortedSessions.map(session => {
    let bestValue: number;
    switch (metric) {
      case 'duration':
        bestValue = session.stats.longestRunDuration;
        break;
      case 'distance':
        bestValue = session.stats.longestRunDistance;
        break;
      case 'speed':
        bestValue = session.stats.bestMaxSpeed;
        break;
      case 'runs':
        bestValue = session.stats.numberOfRuns;
        break;
      default:
        bestValue = 0;
    }
    return {
      date: format(new Date(session.date), 'dd/MM/yy', { locale }),
      fullDate: format(new Date(session.date), 'EEEE d MMMM yyyy', { locale }),
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
      default:
        return '';
    }
  };

  const getLabel = () => {
    switch (metric) {
      case 'duration':
        return t('charts.bestDuration');
      case 'distance':
        return t('charts.bestDistance');
      case 'speed':
        return t('charts.maxSpeed');
      case 'runs':
        return t('charts.numberOfRuns');
      default:
        return '';
    }
  };

  const label = getLabel();
  const unit = getUnit();

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          {t('charts.notEnoughData')}
        </div>
      </div>
    );
  }

  // Default brush window to roughly the last 30 sessions when history is long.
  const brushStart = Math.max(0, data.length - 30);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 mb-4">
        {data.length} {t('charts.sessionsSinceFirst')}
      </p>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#6b7280' }}
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
              formatter={(value) => [`${value}${unit}`, label]}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const p = payload[0].payload as { fullDate: string; sessionName: string };
                  return `${p.fullDate}\n${p.sessionName}`;
                }
                return '';
              }}
            />
            <Line
              type="monotone"
              dataKey="bestValue"
              name={label}
              stroke="#0d9488"
              strokeWidth={2}
              dot={{ fill: '#0d9488', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 6, fill: '#0d9488' }}
            />
            {data.length > 15 && (
              <Brush
                dataKey="date"
                height={24}
                stroke="#0d9488"
                startIndex={brushStart}
                travellerWidth={10}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
