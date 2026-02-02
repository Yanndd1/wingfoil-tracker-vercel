import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Timer, Ruler, Zap, ChevronRight, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WingfoilSession } from '../../types';
import { formatDuration, formatDistance } from '../../utils/runDetection';

interface SessionCardProps {
  session: WingfoilSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const formattedDate = format(new Date(session.date), 'EEEE d MMMM yyyy', {
    locale: fr,
  });

  return (
    <Link
      to={`/session/${session.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-ocean-300 transition-all duration-200"
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {session.name}
            </h3>
            <p className="mt-1 text-sm text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <Zap className="h-3 w-3 mr-1" />
              Runs
            </div>
            <p className="text-lg font-bold text-gray-900">
              {session.stats.numberOfRuns}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <Timer className="h-3 w-3 mr-1" />
              Durée moy.
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatDuration(session.stats.averageRunDuration)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <Ruler className="h-3 w-3 mr-1" />
              Distance moy.
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatDistance(session.stats.averageRunDistance)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center text-gray-500 text-xs mb-1">
              <Zap className="h-3 w-3 mr-1" />
              Vitesse max
            </div>
            <p className="text-lg font-bold text-gray-900">
              {session.stats.bestMaxSpeed.toFixed(1)} km/h
            </p>
          </div>
        </div>

        {session.stats.averageHeartrate && (
          <div className="mt-3 flex items-center text-sm text-gray-500">
            <Heart className="h-4 w-4 mr-1 text-red-500" />
            <span>
              FC moy: {session.stats.averageHeartrate} bpm
              {session.stats.maxHeartrate && ` / max: ${session.stats.maxHeartrate} bpm`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default SessionCard;
