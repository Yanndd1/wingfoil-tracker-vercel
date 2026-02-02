import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { WingfoilSession, WingRun, RunDetectionConfig } from '../../types';
import { formatDuration } from '../../utils/runDetection';

interface SessionSpeedChartProps {
  session: WingfoilSession;
  config: RunDetectionConfig;
  selectedRun?: WingRun | null;
  onSelectRun?: (run: WingRun | null) => void;
}

const SessionSpeedChart: React.FC<SessionSpeedChartProps> = ({
  session,
  config,
  selectedRun,
}) => {
  if (!session.rawData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitesse durant la session</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          Données brutes non disponibles
        </div>
      </div>
    );
  }

  // Downsample data for performance
  const sampleRate = Math.max(1, Math.floor(session.rawData.time.length / 500));

  const data = session.rawData.time
    .filter((_, i) => i % sampleRate === 0)
    .map((time, i) => {
      const actualIndex = i * sampleRate;
      const speed = session.rawData!.speed[actualIndex] || 0;
      const heartrate = session.rawData!.heartrate?.[actualIndex];

      // Check if this point is within a run
      const isInRun = session.runs.some(
        run => actualIndex >= run.startIndex && actualIndex <= run.endIndex
      );

      // Check if in selected run
      const isInSelectedRun =
        selectedRun &&
        actualIndex >= selectedRun.startIndex &&
        actualIndex <= selectedRun.endIndex;

      return {
        time,
        timeLabel: formatDuration(time),
        speed: Math.round(speed * 10) / 10,
        heartrate,
        isInRun,
        isInSelectedRun,
        fillOpacity: isInSelectedRun ? 0.8 : isInRun ? 0.4 : 0.1,
      };
    });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitesse durant la session</h3>
      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="timeLabel"
              tick={{ fontSize: 10, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickLine={{ stroke: '#e5e7eb' }}
              unit=" km/h"
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value, name) => {
                if (name === 'speed') return [`${value} km/h`, 'Vitesse'];
                if (name === 'heartrate') return [`${value} bpm`, 'FC'];
                return [value, name];
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]) {
                  const p = payload[0].payload as { timeLabel: string };
                  return `Temps: ${p.timeLabel}`;
                }
                return '';
              }}
            />
            <ReferenceLine
              y={config.minSpeedThreshold}
              stroke="#ef4444"
              strokeDasharray="5 5"
              label={{
                value: `Seuil: ${config.minSpeedThreshold} km/h`,
                fill: '#ef4444',
                fontSize: 10,
                position: 'right',
              }}
            />
            <Area
              type="monotone"
              dataKey="speed"
              stroke="#0d9488"
              strokeWidth={1.5}
              fill="url(#speedGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-ocean-500/40 rounded mr-2"></div>
          <span>Runs de wing détectés</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-red-500 mr-2" style={{ borderStyle: 'dashed' }}></div>
          <span>Seuil de vitesse ({config.minSpeedThreshold} km/h)</span>
        </div>
      </div>
    </div>
  );
};

export default SessionSpeedChart;
