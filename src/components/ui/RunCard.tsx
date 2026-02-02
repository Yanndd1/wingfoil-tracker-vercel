import React from 'react';
import { Timer, Ruler, Zap, Heart } from 'lucide-react';
import { WingRun } from '../../types';
import { formatDuration, formatDistance } from '../../utils/runDetection';

interface RunCardProps {
  run: WingRun;
  index: number;
  isSelected?: boolean;
  onClick?: () => void;
}

const RunCard: React.FC<RunCardProps> = ({ run, index, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-3 transition-all duration-200 ${
        isSelected
          ? 'border-ocean-500 bg-ocean-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-ocean-300 hover:shadow-sm'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ocean-100 text-ocean-700 font-bold text-sm">
          {index + 1}
        </span>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{formatDuration(run.startTime)} - {formatDuration(run.endTime)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
        <div className="flex items-center space-x-1.5">
          <Timer className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {formatDuration(run.duration)}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Ruler className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {formatDistance(run.distance)}
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Zap className="h-3.5 w-3.5 text-gray-400" />
          <span className="text-sm font-medium text-gray-900">
            {run.averageSpeed} km/h
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <Zap className="h-3.5 w-3.5 text-ocean-500" />
          <span className="text-sm font-medium text-gray-900">
            max {run.maxSpeed} km/h
          </span>
        </div>
      </div>

      {run.averageHeartrate && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1.5">
            <Heart className="h-3.5 w-3.5 text-red-500" />
            <span className="text-gray-600">
              {run.averageHeartrate} bpm
            </span>
          </div>
          {run.maxHeartrate && (
            <span className="text-gray-400">
              max {run.maxHeartrate} bpm
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RunCard;
