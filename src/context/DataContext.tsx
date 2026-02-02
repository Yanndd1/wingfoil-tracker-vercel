import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WingfoilSession, RunDetectionConfig, ProgressStats, StravaActivity } from '../types';
import * as storage from '../services/storage';
import { StorageQuotaError } from '../services/storage';
import * as stravaService from '../services/strava';
import { detectRuns, calculateSessionStats } from '../utils/runDetection';
import { useAuth } from './AuthContext';

interface DataContextType {
  sessions: WingfoilSession[];
  config: RunDetectionConfig;
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  progressStats: ProgressStats | null;
  syncActivities: () => Promise<number>;
  importActivity: (activityId: number) => Promise<WingfoilSession | null>;
  deleteSession: (sessionId: string) => void;
  updateConfig: (config: Partial<RunDetectionConfig>) => void;
  reprocessSession: (sessionId: string) => Promise<void>;
  getSession: (sessionId: string) => WingfoilSession | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<WingfoilSession[]>([]);
  const [config, setConfig] = useState<RunDetectionConfig>(storage.getConfig());
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);

  // Load sessions from storage on mount and migrate if needed
  useEffect(() => {
    // Try to migrate to compressed format on first load
    try {
      const migrationResult = storage.migrateToCompressedStorage();
      if (migrationResult.migrated) {
        console.log(`Migrated to compressed storage. Saved ${Math.round(migrationResult.savedBytes / 1024)} KB`);
      }
    } catch (e) {
      console.warn('Migration failed, attempting to prune old sessions:', e);
      // If migration fails due to quota, prune old sessions
      try {
        const pruned = storage.pruneOldSessionsRawData(20);
        if (pruned > 0) {
          console.log(`Pruned rawData from ${pruned} old sessions to free space`);
        }
      } catch (pruneError) {
        console.error('Failed to prune sessions:', pruneError);
      }
    }

    const loadedSessions = storage.getSessions();
    setSessions(loadedSessions);
    setIsLoading(false);
  }, []);

  // Calculate progress stats whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      const stats = calculateProgressStats(sessions);
      setProgressStats(stats);
    } else {
      setProgressStats(null);
    }
  }, [sessions]);

  const calculateProgressStats = (sessions: WingfoilSession[]): ProgressStats => {
    const allRuns = sessions.flatMap(s => s.runs);
    const totalRuns = allRuns.length;
    const totalSessions = sessions.length;

    const totalRidingTime = allRuns.reduce((sum, r) => sum + r.duration, 0);
    const totalRidingDistance = allRuns.reduce((sum, r) => sum + r.distance, 0);

    // Recent sessions for trend calculation (last 5 vs previous 5)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const recentSessions = sortedSessions.slice(0, 5);
    const previousSessions = sortedSessions.slice(5, 10);

    const recentAvgDuration =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.stats.averageRunDuration, 0) /
          recentSessions.length
        : 0;

    const previousAvgDuration =
      previousSessions.length > 0
        ? previousSessions.reduce((sum, s) => sum + s.stats.averageRunDuration, 0) /
          previousSessions.length
        : 0;

    const recentAvgDistance =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.stats.averageRunDistance, 0) /
          recentSessions.length
        : 0;

    const previousAvgDistance =
      previousSessions.length > 0
        ? previousSessions.reduce((sum, s) => sum + s.stats.averageRunDistance, 0) /
          previousSessions.length
        : 0;

    const recentAvgRuns =
      recentSessions.length > 0
        ? recentSessions.reduce((sum, s) => sum + s.stats.numberOfRuns, 0) / recentSessions.length
        : 0;

    const previousAvgRuns =
      previousSessions.length > 0
        ? previousSessions.reduce((sum, s) => sum + s.stats.numberOfRuns, 0) /
          previousSessions.length
        : 0;

    const calculateTrend = (recent: number, previous: number): number => {
      if (previous === 0) return 0;
      return ((recent - previous) / previous) * 100;
    };

    return {
      totalSessions,
      totalRuns,
      totalRidingTime,
      totalRidingDistance,
      averageRunsPerSession: totalSessions > 0 ? totalRuns / totalSessions : 0,
      averageRunDuration: totalRuns > 0 ? totalRidingTime / totalRuns : 0,
      averageRunDistance: totalRuns > 0 ? totalRidingDistance / totalRuns : 0,
      bestRunDuration: allRuns.length > 0 ? Math.max(...allRuns.map(r => r.duration)) : 0,
      bestRunDistance: allRuns.length > 0 ? Math.max(...allRuns.map(r => r.distance)) : 0,
      bestMaxSpeed: allRuns.length > 0 ? Math.max(...allRuns.map(r => r.maxSpeed)) : 0,
      recentTrend: {
        runDuration: calculateTrend(recentAvgDuration, previousAvgDuration),
        runDistance: calculateTrend(recentAvgDistance, previousAvgDistance),
        runsPerSession: calculateTrend(recentAvgRuns, previousAvgRuns),
      },
    };
  };

  const processActivityToSession = async (
    activity: StravaActivity
  ): Promise<WingfoilSession | null> => {
    try {
      const streams = await stravaService.getActivityStreams(activity.id);

      if (!streams.time?.data || !streams.velocity_smooth?.data || !streams.distance?.data) {
        console.warn('Activity missing required stream data:', activity.id);
        return null;
      }

      const runs = detectRuns(
        streams.time.data,
        streams.velocity_smooth.data,
        streams.distance.data,
        config,
        streams.heartrate?.data,
        streams.latlng?.data
      );

      if (runs.length === 0) {
        console.warn('No runs detected in activity:', activity.id);
        return null;
      }

      const stats = calculateSessionStats(runs);

      const session: WingfoilSession = {
        id: `session_${activity.id}`,
        stravaActivityId: activity.id,
        name: activity.name,
        date: activity.start_date_local,
        totalDuration: activity.elapsed_time,
        totalDistance: activity.distance,
        runs,
        stats,
        rawData: {
          time: streams.time.data,
          speed: streams.velocity_smooth.data.map(s => s * 3.6), // Convert to km/h
          heartrate: streams.heartrate?.data,
          distance: streams.distance.data,
          latlng: streams.latlng?.data,
        },
      };

      return session;
    } catch (error) {
      console.error('Error processing activity:', activity.id, error);
      return null;
    }
  };

  const syncActivities = useCallback(async (): Promise<number> => {
    if (!isAuthenticated) {
      setError('Not authenticated');
      return 0;
    }

    setIsSyncing(true);
    setError(null);

    try {
      // Get last sync time
      const lastSync = storage.getLastSync();
      const after = lastSync ? lastSync : undefined;

      // Fetch activities from Strava
      const activities = await stravaService.getWingfoilActivities(after);

      let importedCount = 0;

      for (const activity of activities) {
        // Check if already imported
        const existingSession = sessions.find(s => s.stravaActivityId === activity.id);
        if (!existingSession) {
          const session = await processActivityToSession(activity);
          if (session) {
            storage.addSession(session);
            importedCount++;
          }
        }
      }

      // Update last sync time
      storage.setLastSync(Math.floor(Date.now() / 1000));

      // Reload sessions from storage
      const updatedSessions = storage.getSessions();
      setSessions(updatedSessions);

      return importedCount;
    } catch (error) {
      if (error instanceof StorageQuotaError) {
        // Try to free space by pruning old sessions
        try {
          const pruned = storage.pruneOldSessionsRawData(20);
          if (pruned > 0) {
            setError(`Stockage plein. ${pruned} anciennes sessions ont été optimisées. Réessayez la synchronisation.`);
          } else {
            setError('Stockage plein. Supprimez des sessions pour continuer.');
          }
        } catch {
          setError('Stockage plein. Supprimez des sessions pour continuer.');
        }
      } else {
        const message = error instanceof Error ? error.message : 'Sync failed';
        setError(message);
      }
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, sessions, config]);

  const importActivity = useCallback(
    async (activityId: number): Promise<WingfoilSession | null> => {
      if (!isAuthenticated) {
        setError('Not authenticated');
        return null;
      }

      setIsSyncing(true);
      setError(null);

      try {
        const activity = await stravaService.getActivity(activityId);
        const session = await processActivityToSession(activity);

        if (session) {
          storage.addSession(session);
          const updatedSessions = storage.getSessions();
          setSessions(updatedSessions);
        }

        return session;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Import failed';
        setError(message);
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [isAuthenticated, config]
  );

  const deleteSession = useCallback((sessionId: string) => {
    storage.deleteSession(sessionId);
    const updatedSessions = storage.getSessions();
    setSessions(updatedSessions);
  }, []);

  const updateConfig = useCallback(
    (newConfig: Partial<RunDetectionConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      storage.saveConfig(updatedConfig);
      setConfig(updatedConfig);
    },
    [config]
  );

  const reprocessSession = useCallback(
    async (sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (!session || !session.rawData) {
        return;
      }

      const runs = detectRuns(
        session.rawData.time,
        session.rawData.speed.map(s => s / 3.6), // Convert back to m/s
        session.rawData.distance,
        config,
        session.rawData.heartrate,
        session.rawData.latlng
      );

      const stats = calculateSessionStats(runs);

      const updatedSession: WingfoilSession = {
        ...session,
        runs,
        stats,
      };

      storage.addSession(updatedSession);
      const updatedSessions = storage.getSessions();
      setSessions(updatedSessions);
    },
    [sessions, config]
  );

  const getSession = useCallback(
    (sessionId: string): WingfoilSession | null => {
      return sessions.find(s => s.id === sessionId) || null;
    },
    [sessions]
  );

  return (
    <DataContext.Provider
      value={{
        sessions,
        config,
        isLoading,
        isSyncing,
        error,
        progressStats,
        syncActivities,
        importActivity,
        deleteSession,
        updateConfig,
        reprocessSession,
        getSession,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
