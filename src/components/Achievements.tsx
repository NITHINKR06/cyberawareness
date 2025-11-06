import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { achievements } from '../data/mockData';
import { Award, Lock, CheckCircle, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useEffect, useState } from 'react';
import { userService } from '../services/backendApi';

export default function Achievements() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const completedModules = user ? Math.floor((user.totalPoints / 150) * 0.6) : 0;
  const [totalReports, setTotalReports] = useState(0);

  useEffect(() => {
    let mounted = true;
    userService.getStats()
      .then((stats: any) => {
        if (!mounted) return;
        const reports = stats?.activity?.totalReports ?? 0;
        setTotalReports(reports);
      })
      .catch(() => setTotalReports(0));
    return () => { mounted = false; };
  }, []);

  const getAchievementStatus = (achievement: typeof achievements[0]) => {
    if (!user) return { unlocked: false, progress: 0 };

    let currentValue = 0;
    let unlocked = false;

    switch (achievement.requirementType) {
      case 'points':
        currentValue = user.totalPoints;
        unlocked = user.totalPoints >= achievement.requirementValue;
        break;
      case 'modules':
        currentValue = completedModules;
        unlocked = completedModules >= achievement.requirementValue;
        break;
      case 'streak':
        currentValue = user.currentStreak;
        unlocked = user.currentStreak >= achievement.requirementValue;
        break;
      case 'reports':
        currentValue = totalReports;
        unlocked = totalReports >= achievement.requirementValue;
        break;
    }

    const progress = Math.min((currentValue / achievement.requirementValue) * 100, 100);

    return { unlocked, progress, currentValue };
  };

  const unlockedCount = achievements.filter(a => getAchievementStatus(a).unlocked).length;

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Award;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('achievements.title')}</h1>
        <p className="text-gray-400">
          {t('achievements.subtitle')}
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t('achievements.progressTitle')}</h2>
            <p className="text-blue-100">
              {t('achievements.progressSubtitle', { unlocked: unlockedCount, total: achievements.length })}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{unlockedCount}/{achievements.length}</div>
            <div className="flex items-center gap-1 justify-center">
              {[...Array(achievements.length)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < unlockedCount
                      ? 'text-yellow-300 fill-yellow-300'
                      : 'text-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement) => {
          const { unlocked, progress, currentValue } = getAchievementStatus(achievement);
          const IconComponent = getIconComponent(achievement.icon);

          return (
            <div
              key={achievement.id}
              className={`rounded-xl shadow-sm p-6 border-2 transition-all ${
                unlocked
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg ${
                    unlocked ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <IconComponent
                    className={`w-8 h-8 ${
                      unlocked ? 'text-white' : 'text-gray-400'
                    }`}
                  />
                </div>
                {unlocked ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  unlocked ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {achievement.name}
              </h3>
              <p
                className={`text-sm mb-4 ${
                  unlocked ? 'text-gray-700' : 'text-gray-500'
                }`}
              >
                {achievement.description}
              </p>

              {!unlocked && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{t('achievements.progress')}</span>
                    <span className="font-semibold text-gray-800">
                      {currentValue} / {achievement.requirementValue}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div
                className={`flex items-center gap-2 pt-4 border-t ${
                  unlocked ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <Award
                  className={`w-5 h-5 ${
                    unlocked ? 'text-yellow-500' : 'text-gray-400'
                  }`}
                />
                <span
                  className={`font-semibold ${
                    unlocked ? 'text-gray-800' : 'text-gray-500'
                  }`}
                >
                  {t('achievements.points', { points: achievement.pointsReward })}
                </span>
              </div>

              {unlocked && (
                <div className="mt-3 bg-green-100 rounded-lg p-2 text-center">
                  <span className="text-sm font-semibold text-green-700">
                    {t('achievements.unlocked')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-800 mb-3">{t('achievements.howToUnlock')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700 mb-2">{t('achievements.completeModules')}</p>
            <p className="text-gray-400">
              {t('achievements.completeModulesDesc')}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">{t('achievements.earnPoints')}</p>
            <p className="text-gray-400">
              {t('achievements.earnPointsDesc')}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">{t('achievements.buildStreaks')}</p>
            <p className="text-gray-400">
              {t('achievements.buildStreaksDesc')}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-700 mb-2">{t('achievements.reportScams')}</p>
            <p className="text-gray-400">
              {t('achievements.reportScamsDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
