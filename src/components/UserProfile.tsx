import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { User, Mail, Award, Calendar, Save, ArrowLeft, Eye, EyeOff, History, Trophy, Clock, FileText, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import { userService } from '../services/backendApi';
import { badges } from '../data/mockData';

export default function UserProfile() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  // Load activity history
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      try {
        setLoadingHistory(true);
        const history = await userService.getHistory();
        setActivityHistory(history.history || []);
      } catch (error) {
        console.error('Error loading activity history:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
    // Refresh every 30 seconds
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors before saving');
      return;
    }

    setIsLoading(true);
    try {
      const updateData: any = {
        username: formData.username,
        email: formData.email,
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      await updateUser(updateData);
      setIsEditing(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }));
    setErrors({});
  };

  // Calculate earned badges based on user points
  const earnedBadges = badges.filter(b => (user?.totalPoints || 0) >= b.requirementPoints);
  const nextBadge = badges.find(b => (user?.totalPoints || 0) < b.requirementPoints);

  const getBadgeColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-amber-800';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('profile.title', 'User Profile')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('profile.subtitle', 'Manage your account settings and preferences')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {user?.username}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {user?.email}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Level</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.level || 1}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">Points</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {user?.totalPoints || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('profile.personalInfo', 'Personal Information')}
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  <User className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                    errors.username
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.username}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-colors ${
                      errors.email
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    } ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Section */}
              {isEditing && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                            errors.currentPassword
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                            errors.newPassword
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                            errors.confirmPassword
                              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {isLoading ? t('common.processing', 'Saving...') : t('profile.saveChanges')}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('profile.badges', 'Your Badges')}
          </h2>
        </div>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t('profile.noBadges', 'No badges earned yet. Keep earning points to unlock badges!')}
          </p>
        )}

        {nextBadge && (
          <div className="border-2 border-dashed rounded-lg p-4 bg-white/5 dark:bg-white/5 border-gray-300 dark:border-gray-600">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{nextBadge.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('profile.nextBadge', 'Earn {{points}} more points to unlock', { 
                    points: nextBadge.requirementPoints - (user?.totalPoints || 0)
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity History Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('profile.activityHistory', 'Activity History')}
          </h2>
        </div>

        {loadingHistory ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading history...</p>
          </div>
        ) : activityHistory.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activityHistory.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-white/5 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'report' ? (
                    <FileText className="w-5 h-5 text-red-500" />
                  ) : activity.type === 'analysis' ? (
                    <Search className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {activity.type === 'report' 
                          ? t('profile.reportActivity', 'Scam Report Submitted')
                          : activity.type === 'analysis'
                          ? t('profile.analysisActivity', 'Content Analysis')
                          : activity.description || t('profile.activity', 'Activity')
                        }
                      </p>
                      {activity.content && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {activity.content}
                        </p>
                      )}
                      {activity.url && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                          {activity.url}
                        </p>
                      )}
                      {activity.threatLevel && (
                        <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          activity.threatLevel === 'dangerous' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : activity.threatLevel === 'suspicious'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {activity.threatLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {activity.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.createdAt)}
                        </p>
                      )}
                      {activity.pointsAwarded && activity.pointsAwarded > 0 && (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
                          +{activity.pointsAwarded} {t('profile.points', 'points')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {t('profile.noHistory', 'No activity history yet. Start analyzing content or reporting scams to see your activity here!')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
