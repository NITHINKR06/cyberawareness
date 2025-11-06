import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';

export default function Leaderboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">{rank}</span>;
    }
  };

  const getRankBackground = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const currentUserEntry = {
    userId: user?.id || '',
    username: user?.username || '',
    totalPoints: user?.totalPoints || 0,
    level: user?.level || 1,
    rank: 1,
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">{t('leaderboard.title')}</h1>
        <p className="text-gray-400">
          {t('leaderboard.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t('leaderboard.yourRank')}</h3>
            </div>
            <div className="text-center py-4">
              <div className="text-5xl font-bold text-blue-600 mb-2">#{currentUserEntry.rank}</div>
              <p className="text-sm text-gray-600">{t('leaderboard.outOfUsers', { count: 1 })}</p>
            </div>
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('leaderboard.yourPoints')}</span>
                <span className="font-semibold text-gray-800">{currentUserEntry.totalPoints}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{t('leaderboard.yourLevel')}</span>
                <span className="font-semibold text-gray-800">{currentUserEntry.level}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-sm p-6 mt-6 text-white">
            <h3 className="font-bold mb-3">{t('leaderboard.climbRanks')}</h3>
            <p className="text-sm text-blue-50 mb-4">
              {t('leaderboard.climbDesc')}
            </p>
            <div className="bg-white/20 rounded-lg p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>{t('leaderboard.pointsToNext')}</span>
                <span className="font-bold">
                  N/A
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6">
              <div className="flex items-center gap-3 text-white">
                <Trophy className="w-8 h-8" />
                <h2 className="text-2xl font-bold">{t('leaderboard.topPerformers')}</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              <div className={`p-4 border-2 ${getRankBackground(1)} transition-all`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 flex items-center justify-center flex-shrink-0">
                    {getRankIcon(1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-800 truncate">
                        {currentUserEntry.username || 'You'}
                      </h3>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {t('leaderboard.you')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{t('common.level', { level: currentUserEntry.level })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xl text-gray-800">
                      {currentUserEntry.totalPoints.toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-600">{t('leaderboard.points')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-400">
              <div className="flex items-center gap-3">
                <Crown className="w-10 h-10 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('leaderboard.topScore')}</p>
                  <p className="text-lg font-bold text-gray-800">{currentUserEntry.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('leaderboard.averagePoints')}</p>
                  <p className="text-lg font-bold text-gray-800">{currentUserEntry.totalPoints.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400">
              <div className="flex items-center gap-3">
                <Trophy className="w-10 h-10 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">{t('leaderboard.activeUsers')}</p>
                  <p className="text-lg font-bold text-gray-800">1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
