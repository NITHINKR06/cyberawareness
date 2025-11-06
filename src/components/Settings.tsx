import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Globe, 
  Bell, 
  Shield, 
  Monitor, 
  Moon, 
  Sun,
  Check,
  Save,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    security: boolean;
  };
  privacy: {
    analytics: boolean;
    dataSharing: boolean;
  };
  performance: {
    autoSave: boolean;
    animations: boolean;
  };
}

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState<SettingsData>({
    theme: theme,
    language: i18n.language || 'en',
    notifications: {
      email: true,
      push: true,
      security: true,
    },
    privacy: {
      analytics: false,
      dataSharing: false,
    },
    performance: {
      autoSave: true,
      animations: true,
    },
  });

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Sync theme with context
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  const handleSettingChange = (category: keyof SettingsData, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    setSettings(prev => ({ ...prev, language }));
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      // Here you could also save to backend if needed
      // await saveUserSettings(settings);
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    const defaultSettings: SettingsData = {
      theme: 'system',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        security: true,
      },
      privacy: {
        analytics: false,
        dataSharing: false,
      },
      performance: {
        autoSave: true,
        animations: true,
      },
    };
    
    setSettings(defaultSettings);
    handleLanguageChange('en');
    handleThemeChange('system');
    toast.info('Settings reset to defaults');
  };

  const SettingSection = ({ 
    title, 
    icon: Icon, 
    children 
  }: { 
    title: string; 
    icon: React.ComponentType<{ className?: string }>; 
    children: React.ReactNode;
  }) => (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ 
    enabled, 
    onChange, 
    label, 
    description 
  }: { 
    enabled: boolean; 
    onChange: (enabled: boolean) => void; 
    label: string; 
    description?: string;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500">
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('settings.title', 'Settings')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('settings.subtitle', 'Customize your application experience')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appearance Settings */}
        <SettingSection title={t('settings.appearance', 'Appearance')} icon={Palette}>
          <div className="space-y-6">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('settings.theme', 'Theme')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: t('settings.light', 'Light'), icon: Sun },
                  { value: 'dark', label: t('settings.dark', 'Dark'), icon: Moon },
                  { value: 'system', label: t('settings.system', 'System'), icon: Monitor },
                ].map(({ value, label, icon: ThemeIcon }) => (
                  <button
                    key={value}
                    onClick={() => handleThemeChange(value as any)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                      settings.theme === value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <ThemeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {label}
                    </span>
                    {settings.theme === value && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('settings.language', 'Language')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { code: 'en', name: 'English', nativeName: 'English' },
                  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
                  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
                ].map(({ code, name, nativeName }) => (
                  <button
                    key={code}
                    onClick={() => handleLanguageChange(code)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors ${
                      settings.language === code
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {nativeName}
                    </span>
                    {settings.language === code && (
                      <Check className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Notifications Settings */}
        <SettingSection title={t('settings.notifications', 'Notifications')} icon={Bell}>
          <div className="space-y-6">
            <ToggleSwitch
              enabled={settings.notifications.email}
              onChange={(enabled) => handleSettingChange('notifications', 'email', enabled)}
              label={t('settings.emailNotifications', 'Email Notifications')}
              description={t('settings.emailNotificationsDesc', 'Receive updates via email')}
            />
            
            <ToggleSwitch
              enabled={settings.notifications.push}
              onChange={(enabled) => handleSettingChange('notifications', 'push', enabled)}
              label={t('settings.pushNotifications', 'Push Notifications')}
              description={t('settings.pushNotificationsDesc', 'Receive browser notifications')}
            />
            
            <ToggleSwitch
              enabled={settings.notifications.security}
              onChange={(enabled) => handleSettingChange('notifications', 'security', enabled)}
              label={t('settings.securityAlerts', 'Security Alerts')}
              description={t('settings.securityAlertsDesc', 'Get notified about security issues')}
            />
          </div>
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection title={t('settings.privacy', 'Privacy')} icon={Shield}>
          <div className="space-y-6">
            <ToggleSwitch
              enabled={settings.privacy.analytics}
              onChange={(enabled) => handleSettingChange('privacy', 'analytics', enabled)}
              label={t('settings.analytics', 'Usage Analytics')}
              description={t('settings.analyticsDesc', 'Help improve the app by sharing usage data')}
            />
            
            <ToggleSwitch
              enabled={settings.privacy.dataSharing}
              onChange={(enabled) => handleSettingChange('privacy', 'dataSharing', enabled)}
              label={t('settings.dataSharing', 'Data Sharing')}
              description={t('settings.dataSharingDesc', 'Share anonymized data for research')}
            />
          </div>
        </SettingSection>

        {/* Performance Settings */}
        <SettingSection title={t('settings.performance', 'Performance')} icon={Monitor}>
          <div className="space-y-6">
            <ToggleSwitch
              enabled={settings.performance.autoSave}
              onChange={(enabled) => handleSettingChange('performance', 'autoSave', enabled)}
              label={t('settings.autoSave', 'Auto Save')}
              description={t('settings.autoSaveDesc', 'Automatically save your work')}
            />
            
            <ToggleSwitch
              enabled={settings.performance.animations}
              onChange={(enabled) => handleSettingChange('performance', 'animations', enabled)}
              label={t('settings.animations', 'Animations')}
              description={t('settings.animationsDesc', 'Enable smooth transitions and animations')}
            />
          </div>
        </SettingSection>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleResetSettings}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {t('settings.reset', 'Reset to Defaults')}
        </button>
        
        <button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? t('settings.saving', 'Saving...') : t('settings.save', 'Save Settings')}
        </button>
      </div>
    </div>
  );
}
