export interface User {
  id: string;
  username: string;
  email: string;
  totalPoints: number;
  currentStreak: number;
  level: number;
  avatarUrl?: string;
  isAdmin?: boolean;
  role?: 'user' | 'moderator' | 'admin' | 'superadmin';
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  content: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pointsReward: number;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  completed: boolean;
  score: number;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: 'modules' | 'points' | 'streak' | 'reports';
  requirementValue: number;
  pointsReward: number;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirementPoints: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

export interface ScamReport {
  id: string;
  userId: string;
  scamType: string;
  description: string;
  url?: string;
  phoneNumber?: string;
  email?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  avatarUrl?: string;
  rank: number;
}
