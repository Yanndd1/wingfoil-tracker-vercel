import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Timer,
  Ruler,
  Zap,
  RefreshCw,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import Layout from '../components/layout/Layout';
import StatCard from '../components/ui/StatCard';
import SessionCard from '../components/ui/SessionCard';
import EmptyState from '../components/ui/EmptyState';
import Loading from '../components/ui/Loading';
import ProgressChart from '../components/charts/ProgressChart';
import { formatDuration, formatDistance } from '../utils/runDetection';

const DashboardPage: React.FC = () => {
  const {
    sessions,
    isLoading,
    isSyncing,
    progressStats,
    syncActivities,
    error,
  } = useData();
  const { t } = useTranslation();

  const handleSync = async () => {
    const count = await syncActivities();
    if (count > 0) {
      console.log(`${count} new sessions imported`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading message={t('common.loading')} />
      </Layout>
    );
  }

  const recentSessions = sessions.slice(0, 5);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-500 mt-1">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t('common.loading') : t('common.sync')}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {sessions.length === 0 ? (
          <EmptyState
            title={t('sessions.noSessions')}
            description={t('sessions.noSessionsDesc')}
            action={
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="btn-primary"
              >
                {t('common.sync')}
              </button>
            }
          />
        ) : (
          <>
            {/* Stats Grid */}
            {progressStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title={t('dashboard.totalSessions')}
                  value={progressStats.totalSessions}
                  icon={<Activity className="h-5 w-5 text-ocean-600" />}
                />
                <StatCard
                  title={t('dashboard.totalRuns')}
                  value={progressStats.totalRuns}
                  subtitle={`${progressStats.averageRunsPerSession.toFixed(1)} ${t('dashboard.runsPerSession')}`}
                  icon={<Zap className="h-5 w-5 text-ocean-600" />}
                />
                <StatCard
                  title={t('dashboard.avgDuration')}
                  value={formatDuration(progressStats.averageRunDuration)}
                  trend={progressStats.recentTrend.runDuration}
                  icon={<Timer className="h-5 w-5 text-ocean-600" />}
                />
                <StatCard
                  title={t('dashboard.avgDistance')}
                  value={formatDistance(progressStats.averageRunDistance)}
                  trend={progressStats.recentTrend.runDistance}
                  icon={<Ruler className="h-5 w-5 text-ocean-600" />}
                />
              </div>
            )}

            {/* Personal Bests */}
            {progressStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title={t('dashboard.bestDuration')}
                  value={formatDuration(progressStats.bestRunDuration)}
                  variant="primary"
                  icon={<Timer className="h-5 w-5 text-white" />}
                />
                <StatCard
                  title={t('dashboard.bestDistance')}
                  value={formatDistance(progressStats.bestRunDistance)}
                  variant="primary"
                  icon={<Ruler className="h-5 w-5 text-white" />}
                />
                <StatCard
                  title={t('dashboard.maxSpeed')}
                  value={`${progressStats.bestMaxSpeed.toFixed(1)} km/h`}
                  variant="primary"
                  icon={<Zap className="h-5 w-5 text-white" />}
                />
              </div>
            )}

            {/* Progress Charts */}
            {sessions.length >= 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart
                  sessions={sessions}
                  metric="duration"
                  title={t('sessionDetail.duration')}
                />
                <ProgressChart
                  sessions={sessions}
                  metric="distance"
                  title={t('sessionDetail.distance')}
                />
              </div>
            )}

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="h-5 w-5 text-ocean-600 mr-2" />
                  {t('dashboard.recentSessions')}
                </h2>
                <Link
                  to="/sessions"
                  className="text-sm text-ocean-600 hover:text-ocean-700 font-medium flex items-center"
                >
                  {t('dashboard.viewAll')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {recentSessions.map(session => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default DashboardPage;
