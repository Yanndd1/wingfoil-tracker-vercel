import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Timer,
  Ruler,
  Zap,
  Heart,
  Trash2,
  ExternalLink,
  RefreshCw,
  Trophy,
  Map,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, nl } from 'date-fns/locale';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import RunCard from '../components/ui/RunCard';
import Loading from '../components/ui/Loading';
import SessionSpeedChart from '../components/charts/SessionSpeedChart';
import SessionMap from '../components/maps/SessionMap';
import { formatDuration, formatDistance } from '../utils/runDetection';
import { WingRun } from '../types';

const SessionDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSession, deleteSession, reprocessSession, config, isLoading } = useData();
  const { t, language } = useTranslation();
  const [selectedRun, setSelectedRun] = useState<WingRun | null>(null);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [showMap, setShowMap] = useState(true);

  // Get the appropriate locale for date-fns
  const dateLocale = language === 'fr' ? fr : language === 'nl' ? nl : enUS;

  const session = useMemo(() => {
    if (!sessionId) return null;
    return getSession(sessionId);
  }, [sessionId, getSession]);

  // Find the longest run by duration
  const longestRun = useMemo(() => {
    if (!session || session.runs.length === 0) return null;
    return session.runs.reduce((longest, run) =>
      run.duration > longest.duration ? run : longest
    );
  }, [session]);

  const handleDelete = () => {
    if (!session) return;
    if (confirm(t('sessionDetail.deleteConfirm'))) {
      deleteSession(session.id);
      navigate('/sessions');
    }
  };

  const handleReprocess = async () => {
    if (!session) return;
    setIsReprocessing(true);
    await reprocessSession(session.id);
    setIsReprocessing(false);
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading message={t('common.loading')} />
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('sessionDetail.sessionNotFound')}
          </h2>
          <p className="text-gray-500 mb-4">
            {t('sessionDetail.sessionNotFoundDesc')}
          </p>
          <Link to="/sessions" className="btn-primary">
            {t('sessionDetail.backToSessions')}
          </Link>
        </div>
      </Layout>
    );
  }

  const formattedDate = format(new Date(session.date), 'EEEE d MMMM yyyy', {
    locale: dateLocale,
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.name}</h1>
              <p className="text-gray-500 mt-1 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleReprocess}
              disabled={isReprocessing}
              className="btn-secondary flex items-center space-x-2"
              title={t('common.reanalyze')}
            >
              <RefreshCw
                className={`h-4 w-4 ${isReprocessing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">{t('common.reanalyze')}</span>
            </button>
            <a
              href={`https://www.strava.com/activities/${session.stravaActivityId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">{t('common.viewOnStrava')}</span>
            </a>
            <button
              onClick={handleDelete}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title={t('common.delete')}
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={t('sessionDetail.numberOfRuns')}
            value={session.stats.numberOfRuns}
            icon={<Zap className="h-5 w-5 text-ocean-600" />}
          />
          <StatCard
            title={t('sessionDetail.totalRideTime')}
            value={formatDuration(session.stats.totalRidingTime)}
            icon={<Timer className="h-5 w-5 text-ocean-600" />}
          />
          <StatCard
            title={t('sessionDetail.totalDistance')}
            value={formatDistance(session.stats.totalRidingDistance)}
            icon={<Ruler className="h-5 w-5 text-ocean-600" />}
          />
          <StatCard
            title={t('sessionDetail.maxSpeed')}
            value={`${session.stats.bestMaxSpeed.toFixed(1)} km/h`}
            icon={<Zap className="h-5 w-5 text-ocean-600" />}
          />
        </div>

        {/* Averages */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title={t('sessionDetail.avgDurationPerRun')}
            value={formatDuration(session.stats.averageRunDuration)}
            subtitle={`${t('sessionDetail.best')}: ${formatDuration(session.stats.longestRunDuration)}`}
            variant="primary"
          />
          <StatCard
            title={t('sessionDetail.avgDistancePerRun')}
            value={formatDistance(session.stats.averageRunDistance)}
            subtitle={`${t('sessionDetail.best')}: ${formatDistance(session.stats.longestRunDistance)}`}
            variant="primary"
          />
          <StatCard
            title={t('sessionDetail.avgSpeed')}
            value={`${session.stats.bestAverageSpeed.toFixed(1)} km/h`}
            subtitle={`${t('sessionDetail.max')}: ${session.stats.bestMaxSpeed.toFixed(1)} km/h`}
            variant="primary"
          />
        </div>

        {/* Heart Rate Stats */}
        {session.stats.averageHeartrate && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              {t('sessionDetail.heartRate')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('sessionDetail.average')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {session.stats.averageHeartrate} bpm
                </p>
              </div>
              {session.stats.maxHeartrate && (
                <div>
                  <p className="text-sm text-gray-500">{t('sessionDetail.maximum')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {session.stats.maxHeartrate} bpm
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Longest Run Focus */}
        {longestRun && (
          <div className="bg-gradient-to-br from-ocean-50 to-ocean-100 rounded-xl shadow-sm border border-ocean-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-ocean-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 text-ocean-600 mr-2" />
              {t('sessionDetail.longestRun')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.duration')}</p>
                <p className="text-xl font-bold text-ocean-900">
                  {formatDuration(longestRun.duration)}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.distance')}</p>
                <p className="text-xl font-bold text-ocean-900">
                  {formatDistance(longestRun.distance)}
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.avgSpeed')}</p>
                <p className="text-xl font-bold text-ocean-900">
                  {longestRun.averageSpeed.toFixed(1)} km/h
                </p>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.maxSpeed')}</p>
                <p className="text-xl font-bold text-ocean-900">
                  {longestRun.maxSpeed.toFixed(1)} km/h
                </p>
              </div>
              {longestRun.averageHeartrate && (
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.avgHR')}</p>
                  <p className="text-xl font-bold text-ocean-900">
                    {longestRun.averageHeartrate} bpm
                  </p>
                </div>
              )}
              {(longestRun.startHeartrate || longestRun.endHeartrate) && (
                <div className="bg-white/70 rounded-lg p-3">
                  <p className="text-xs text-ocean-600 font-medium">{t('sessionDetail.hrStartEnd')}</p>
                  <p className="text-xl font-bold text-ocean-900">
                    {longestRun.startHeartrate ?? '—'} → {longestRun.endHeartrate ?? '—'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Section */}
        {session.rawData?.latlng && session.rawData.latlng.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Map className="h-5 w-5 text-ocean-600 mr-2" />
                {t('map.showMap')}
              </h2>
              <button
                onClick={() => setShowMap(!showMap)}
                className="text-sm text-ocean-600 hover:text-ocean-700"
              >
                {showMap ? t('map.hideMap') : t('map.showMap')}
              </button>
            </div>
            {showMap && (
              <SessionMap
                session={session}
                selectedRun={selectedRun}
                onSelectRun={setSelectedRun}
                height="400px"
              />
            )}
          </div>
        )}

        {/* Speed Chart */}
        <SessionSpeedChart
          session={session}
          config={config}
          selectedRun={selectedRun}
          onSelectRun={setSelectedRun}
        />

        {/* Runs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="h-5 w-5 text-ocean-600 mr-2" />
            {t('sessionDetail.runDetails')} ({session.runs.length})
          </h2>
          <div className="space-y-3">
            {session.runs.map((run, index) => (
              <RunCard
                key={run.id}
                run={run}
                index={index}
                isSelected={selectedRun?.id === run.id}
                onClick={() =>
                  setSelectedRun(selectedRun?.id === run.id ? null : run)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SessionDetailPage;
