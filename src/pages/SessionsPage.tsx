import React, { useState, useMemo } from 'react';
import { Search, Calendar, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, nl } from 'date-fns/locale';
import { useData } from '../context/DataContext';
import { useTranslation } from '../context/LanguageContext';
import Layout from '../components/layout/Layout';
import SessionCard from '../components/ui/SessionCard';
import EmptyState from '../components/ui/EmptyState';
import Loading from '../components/ui/Loading';

const SessionsPage: React.FC = () => {
  const { sessions, isLoading, isSyncing, syncActivities } = useData();
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | 'year'>('all');

  // Get the appropriate locale for date-fns
  const dateLocale = language === 'fr' ? fr : language === 'nl' ? nl : enUS;

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        session =>
          session.name.toLowerCase().includes(query) ||
          format(new Date(session.date), 'MMMM yyyy', { locale: dateLocale })
            .toLowerCase()
            .includes(query)
      );
    }

    // Date filter
    const now = new Date();
    if (dateFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filtered = filtered.filter(session => new Date(session.date) >= monthAgo);
    } else if (dateFilter === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filtered = filtered.filter(session => new Date(session.date) >= yearAgo);
    }

    return filtered;
  }, [sessions, searchQuery, dateFilter, dateLocale]);

  // Group sessions by month
  const groupedSessions = useMemo(() => {
    const groups: { [key: string]: typeof sessions } = {};

    filteredSessions.forEach(session => {
      const monthKey = format(new Date(session.date), 'MMMM yyyy', { locale: dateLocale });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(session);
    });

    return groups;
  }, [filteredSessions, dateLocale]);

  const handleSync = async () => {
    await syncActivities();
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading message={t('common.loading')} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('sessions.title')}</h1>
            <p className="text-gray-500 mt-1">
              {sessions.length} {t('common.session')}{sessions.length !== 1 ? 's' : ''}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('sessions.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Date filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as 'all' | 'month' | 'year')}
              className="input-field w-auto"
            >
              <option value="all">{t('sessions.allDates')}</option>
              <option value="month">{t('sessions.lastMonth')}</option>
              <option value="year">{t('sessions.lastYear')}</option>
            </select>
          </div>
        </div>

        {/* Sessions list */}
        {filteredSessions.length === 0 ? (
          <EmptyState
            title={sessions.length === 0 ? t('sessions.noSessions') : t('sessions.noResults')}
            description={
              sessions.length === 0
                ? t('sessions.noSessionsDesc')
                : t('sessions.noResultsDesc')
            }
            icon={<Calendar className="h-8 w-8 text-ocean-500" />}
          />
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSessions).map(([month, monthSessions]) => (
              <div key={month}>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 text-ocean-600 mr-2" />
                  {month}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({monthSessions.length} {t('common.session')}{monthSessions.length !== 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="space-y-4">
                  {monthSessions.map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SessionsPage;
