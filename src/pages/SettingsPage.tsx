import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sliders,
  Trash2,
  AlertTriangle,
  Save,
  RotateCcw,
  Info,
  HardDrive,
  Zap,
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import Layout from '../components/layout/Layout';
import { DEFAULT_CONFIG, getStorageInfo, pruneOldSessionsRawData, migrateToCompressedStorage } from '../services/storage';

const SettingsPage: React.FC = () => {
  const { config, updateConfig, sessions } = useData();
  const { athlete, logout } = useAuth();
  const { t } = useTranslation();
  const [localConfig, setLocalConfig] = useState(config);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{ used: number; total: number; sessionsSize: number } | null>(null);
  const [optimizeMessage, setOptimizeMessage] = useState<string | null>(null);

  // Load storage info
  useEffect(() => {
    setStorageInfo(getStorageInfo());
  }, [sessions]);

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleOptimizeStorage = () => {
    setOptimizeMessage(null);
    try {
      // First try migration
      const migration = migrateToCompressedStorage();
      if (migration.migrated) {
        setOptimizeMessage(`${t('settings.optimizeSuccess')} ${formatBytes(migration.savedBytes)} ${t('settings.optimizeSuccessBytes')}`);
        setStorageInfo(getStorageInfo());
        return;
      }

      // Then prune old sessions
      const pruned = pruneOldSessionsRawData(20);
      if (pruned > 0) {
        setOptimizeMessage(`${pruned} ${t('settings.optimizePruned')}`);
        setStorageInfo(getStorageInfo());
        window.location.reload();
      } else {
        setOptimizeMessage(t('settings.optimizeAlready'));
      }
    } catch (e) {
      setOptimizeMessage(t('settings.optimizeError'));
    }
  };

  const handleConfigChange = (key: keyof typeof config, value: number) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateConfig(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    setHasChanges(true);
  };

  const handleClearAllData = () => {
    if (confirm(t('settings.deleteConfirm'))) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 text-ocean-600 mr-2" />
            {t('settings.title')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('settings.subtitle')}
          </p>
        </div>

        {/* Account Section */}
        {athlete && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.account')}</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {athlete.profile_medium ? (
                  <img
                    src={athlete.profile_medium}
                    alt={athlete.firstname}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-ocean-100 flex items-center justify-center">
                    <span className="text-ocean-600 font-semibold">
                      {athlete.firstname?.[0]}
                      {athlete.lastname?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {athlete.firstname} {athlete.lastname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('settings.connectedVia')}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-secondary text-red-600 hover:bg-red-50"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        )}

        {/* Detection Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Sliders className="h-5 w-5 text-ocean-600 mr-2" />
              {t('settings.detectionSettings')}
            </h2>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              {t('common.reset')}
            </button>
          </div>

          <div className="space-y-6">
            {/* Speed Threshold */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.minSpeedThreshold')}
                </label>
                <span className="text-sm font-semibold text-ocean-600">
                  {localConfig.minSpeedThreshold} km/h
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="15"
                step="0.5"
                value={localConfig.minSpeedThreshold}
                onChange={e =>
                  handleConfigChange('minSpeedThreshold', parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {t('settings.minSpeedDesc')}
              </p>
            </div>

            {/* Min Run Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.minRunDuration')}
                </label>
                <span className="text-sm font-semibold text-ocean-600">
                  {localConfig.minRunDuration} {t('settings.seconds')}
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={localConfig.minRunDuration}
                onChange={e =>
                  handleConfigChange('minRunDuration', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {t('settings.minRunDurationDesc')}
              </p>
            </div>

            {/* Min Stop Duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.minStopDuration')}
                </label>
                <span className="text-sm font-semibold text-ocean-600">
                  {localConfig.minStopDuration} {t('settings.seconds')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={localConfig.minStopDuration}
                onChange={e =>
                  handleConfigChange('minStopDuration', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {t('settings.minStopDurationDesc')}
              </p>
            </div>

            {/* Smoothing Window */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('settings.speedSmoothing')}
                </label>
                <span className="text-sm font-semibold text-ocean-600">
                  {localConfig.speedSmoothingWindow} {t('settings.points')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={localConfig.speedSmoothingWindow}
                onChange={e =>
                  handleConfigChange('speedSmoothingWindow', parseInt(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-600"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {t('settings.speedSmoothingDesc')}
              </p>
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-amber-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {t('settings.unsavedChanges')}
                </p>
                <button onClick={handleSave} className="btn-primary flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  {t('common.save')}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t('settings.saveNote')}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('settings.statistics')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">{t('settings.registeredSessions')}</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">{t('settings.totalRuns')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {sessions.reduce((sum, s) => sum + s.runs.length, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Storage Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HardDrive className="h-5 w-5 text-ocean-600 mr-2" />
            {t('settings.storage')}
          </h2>

          {storageInfo && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{t('settings.usage')}</span>
                  <span className="font-medium text-gray-900">
                    {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      storageInfo.used / storageInfo.total > 0.9
                        ? 'bg-red-500'
                        : storageInfo.used / storageInfo.total > 0.7
                        ? 'bg-amber-500'
                        : 'bg-ocean-500'
                    }`}
                    style={{ width: `${Math.min(100, (storageInfo.used / storageInfo.total) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{t('common.sessions')}:</span> {formatBytes(storageInfo.sessionsSize)}
                  {storageInfo.sessionsSize > 1024 * 1024 && (
                    <span className="text-amber-600 ml-2">({t('settings.large')})</span>
                  )}
                </p>
              </div>

              <button
                onClick={handleOptimizeStorage}
                className="flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50 px-4 py-2 rounded-lg transition-colors w-full justify-center border border-ocean-200"
              >
                <Zap className="h-4 w-4" />
                <span>{t('settings.optimizeStorage')}</span>
              </button>

              {optimizeMessage && (
                <p className={`text-sm p-3 rounded-lg ${
                  optimizeMessage.includes('Erreur') || optimizeMessage.includes('Error')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {optimizeMessage}
                </p>
              )}

              <p className="text-xs text-gray-500 flex items-start">
                <Info className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                {t('settings.optimizeNote')}
              </p>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('settings.dangerZone')}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('settings.dangerZoneDesc')}
          </p>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('settings.deleteAllData')}</span>
          </button>

          {showResetConfirm && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-700 mb-3">
                {t('settings.deleteConfirm')}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleClearAllData}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('settings.deleteYes')}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>{t('settings.appVersion')}</p>
          <p className="mt-1">{t('settings.compatible')}</p>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;
