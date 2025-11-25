import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Trophy, Target, Flame, Award, TrendingUp, Shield, Activity, FileText, Search, Clock } from 'lucide-react';
import { badges, achievements } from '../data/mockData';
import { userService } from '../services/backendApi';
import { 
  ThreatTrendsChart, 
  ThreatDistributionChart, 
  UserProgressChart, 
  SkillRadarChart,
  CommunityActivityChart,
  LiveThreatFeed 
} from './DashboardCharts';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [activityStats, setActivityStats] = useState({
    totalReports: 0,
    totalAnalyses: 0,
    totalActivities: 0
  });
  const [loadingActivities, setLoadingActivities] = useState(true);

  // Load activity history
  useEffect(() => {
    const loadActivities = async () => {
      if (!user) return;
      try {
        setLoadingActivities(true);
        const history = await userService.getHistory();
        setActivityHistory(history.history || []);
        setActivityStats({
          totalReports: history.reports || 0,
          totalAnalyses: history.analyses || 0,
          totalActivities: history.totalActivities || 0
        });
      } catch (error) {
        console.error('Error loading activity history:', error);
      } finally {
        setLoadingActivities(false);
      }
    };

    loadActivities();
    // Refresh every 30 seconds
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Subtle entrance animations
  useEffect(() => {
    let isMounted = true;
    // @ts-ignore - dynamic import without types
    import('gsap').then(({ gsap }) => {
      if (!isMounted) return;
      gsap.to('.dash-fade-up', { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' });
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  if (!user) return null;

  const totalModules = 5;
  const completedModules = Math.floor((user.totalPoints / 150) * 0.6);
  const progressPercentage = (completedModules / totalModules) * 100;

  const earnedBadges = badges.filter(b => user.totalPoints >= b.requirementPoints);
  const nextBadge = badges.find(b => user.totalPoints < b.requirementPoints);

  const completedAchievements = achievements.filter(a => {
    if (a.requirementType === 'points') return user.totalPoints >= a.requirementValue;
    if (a.requirementType === 'modules') return completedModules >= a.requirementValue;
    if (a.requirementType === 'streak') return user.currentStreak >= a.requirementValue;
    return false;
  });

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title mb-2">
          {t('dashboard.welcome', { username: user.username })}
        </h1>
        <p className="text-[rgb(var(--text-secondary))]">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dash-fade-up opacity-0 translate-y-3 card border-l-4 border-indigo-500/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))]">{t('dashboard.totalPoints')}</h3>
            <Trophy className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-[rgb(var(--text-primary))]">{user.totalPoints}</p>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{t('dashboard.keepLearning')}</p>
        </div>

        <div className="dash-fade-up opacity-0 translate-y-3 card border-l-4 border-emerald-500/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))]">{t('dashboard.currentLevel')}</h3>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-[rgb(var(--text-primary))]">{user.level}</p>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
            {t('dashboard.pointsToNext', { 
              points: 500 - (user.totalPoints % 500), 
              level: user.level + 1 
            })}
          </p>
        </div>

        <div className="dash-fade-up opacity-0 translate-y-3 card border-l-4 border-orange-500/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))]">{t('dashboard.currentStreak')}</h3>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <p className="text-3xl font-extrabold text-[rgb(var(--text-primary))]">
            {t('dashboard.daysStreak', { days: user.currentStreak })}
          </p>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">{t('dashboard.maintainStreak')}</p>
        </div>

        <div className="dash-fade-up opacity-0 translate-y-3 card border-l-4 border-purple-500/60">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))]">{t('dashboard.badgesEarned')}</h3>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-[rgb(var(--text-primary))]">{earnedBadges.length}</p>
          <p className="text-xs text-[rgb(var(--text-secondary))] mt-1">
            {t('dashboard.outOf', { total: badges.length })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">{t('dashboard.learningProgress')}</h2>
            <Target className="w-6 h-6 text-indigo-400" />
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-[rgb(var(--text-secondary))]">{t('dashboard.modulesCompleted')}</span>
              <span className="font-semibold text-[rgb(var(--text-primary))]">
                {completedModules} / {totalModules}
              </span>
            </div>
            <div className="w-full rounded-full h-4 overflow-hidden border border-glass bg-[rgba(0,0,0,0.08)] dark:bg-white/10">
              <div
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 shadow-neon"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 10 && (
                  <span className="text-xs font-bold text-white">
                    {Math.round(progressPercentage)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-glass">
            <h3 className="text-sm font-semibold text-[rgb(var(--text-primary))] mb-3">{t('dashboard.recentAchievements')}</h3>
            <div className="space-y-2">
              {completedAchievements.slice(0, 3).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-emerald-500/10 border-emerald-400/30 dark:bg-emerald-500/10 dark:border-emerald-400/30"
                >
                  <div className="bg-emerald-500 p-2 rounded-full">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[rgb(var(--text-primary))] text-sm">{achievement.name}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">{achievement.description}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-300">
                    +{achievement.pointsReward} pts
                  </span>
                </div>
              ))}
              {completedAchievements.length === 0 && (
                <p className="text-sm text-[rgb(var(--text-secondary))] text-center py-4">
                  {t('dashboard.completeModules')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-6">{t('dashboard.yourBadges')}</h2>

          <div className="space-y-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-gradient-to-br ${getBadgeColor(badge.tier)} p-4 rounded-lg shadow-md`}
              >
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-white" />
                  <div>
                    <p className="font-bold text-white">{badge.name}</p>
                    <p className="text-xs text-white/80">{badge.description}</p>
                  </div>
                </div>
              </div>
            ))}

            {nextBadge && (
              <div className="border-2 border-dashed rounded-lg p-4 bg-[rgba(0,0,0,0.04)] border-[rgba(0,0,0,0.12)] dark:bg-white/5 dark:border-white/20">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-[rgb(var(--text-secondary))]" />
                  <div>
                    <p className="font-bold text-[rgb(var(--text-primary))]">{nextBadge.name}</p>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">
                      {t('dashboard.morePointsNeeded', { 
                        points: nextBadge.requirementPoints - user.totalPoints 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Data Visualization Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-6 h-6 text-cyan-400" />
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{t('dashboard.threatIntelligence')}</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card"><ThreatTrendsChart /></div>
          <div className="card"><ThreatDistributionChart /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card">
            <LiveThreatFeed />
          </div>
          <div className="card"><CommunityActivityChart /></div>
        </div>
      </div>

      {/* User Analytics Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">{t('dashboard.yourAnalytics')}</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card"><UserProgressChart /></div>
          <div className="card"><SkillRadarChart /></div>
        </div>
      </div>

      {/* Activity History Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
              {t('dashboard.recentActivity', 'Recent Activity')}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-[rgb(var(--text-secondary))]">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{activityStats.totalReports} {t('dashboard.reports', 'Reports')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>{activityStats.totalAnalyses} {t('dashboard.analyses', 'Analyses')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          {loadingActivities ? (
            <div className="p-8 text-center text-[rgb(var(--text-secondary))]">
              {t('dashboard.loadingActivities', 'Loading activities...')}
            </div>
          ) : activityHistory.length === 0 ? (
            <div className="p-8 text-center text-[rgb(var(--text-secondary))]">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>{t('dashboard.noActivities', 'No activities yet. Start by analyzing scams or reporting suspicious content!')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityHistory.slice(0, 10).map((activity, index) => {
                const date = new Date(activity.createdAt);
                const isReport = activity.type === 'report';
                const isAnalysis = activity.type === 'analysis';
                const data = activity.data;

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-white/15 bg-white/60 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                  >
                    <div className={`p-2 rounded-lg ${
                      isReport ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-purple-100 dark:bg-purple-500/20'
                    }`}>
                      {isReport ? (
                        <FileText className={`w-5 h-5 ${
                          isReport ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
                        }`} />
                      ) : (
                        <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[rgb(var(--text-primary))]">
                          {isReport 
                            ? t('dashboard.scamReport', 'Scam Report')
                            : t('dashboard.scamAnalysis', 'Scam Analysis')
                          }
                        </h3>
                        {isAnalysis && data?.analysisResult?.threatLevel && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            data.analysisResult.threatLevel === 'dangerous'
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                              : data.analysisResult.threatLevel === 'suspicious'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                          }`}>
                            {data.analysisResult.threatLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[rgb(var(--text-secondary))] truncate">
                        {isReport 
                          ? `${t('dashboard.scamType', 'Type')}: ${data?.scamType || 'N/A'} - ${data?.description?.substring(0, 60) || ''}...`
                          : `${t('dashboard.analyzed', 'Analyzed')}: ${data?.inputContent?.substring(0, 60) || ''}...`
                        }
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-[rgb(var(--text-secondary))]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{date.toLocaleDateString()} {date.toLocaleTimeString()}</span>
                        </div>
                        {isReport && data?.status && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            data.status === 'verified'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300'
                          }`}>
                            {data.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
