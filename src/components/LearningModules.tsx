import { useState } from 'react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { learningModules, quizzes } from '../data/mockData';
import { BookOpen, CheckCircle, Star, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LearningModules() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const completedModuleIds = new Set<string>();
  if (user) {
    const completed = Math.floor((user.totalPoints / 150) * 0.6);
    for (let i = 0; i < completed && i < learningModules.length; i++) {
      completedModuleIds.add(learningModules[i].id);
    }
  }

  const module = selectedModule ? learningModules.find(m => m.id === selectedModule) : null;
  const moduleQuizzes = module ? quizzes.filter(q => q.moduleId === module.id || q.moduleId === (module as any).difficulty) : [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return t('modules.difficulty.beginner');
      case 'intermediate': return t('modules.difficulty.intermediate');
      case 'advanced': return t('modules.difficulty.advanced');
      default: return difficulty;
    }
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setQuizCompleted(false);
    setScore(0);
    // @ts-ignore - dynamic import without types
    import('gsap').then(({ gsap }) => {
      gsap.fromTo('.quiz-card', { y: 6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' });
    }).catch(() => {});
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < moduleQuizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const totalPoints = moduleQuizzes.reduce((sum, q) => sum + q.points, 0);
      setScore(totalPoints);
      setQuizCompleted(true);
    }
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setShowQuiz(false);
    setQuizCompleted(false);
  };

  if (quizCompleted && module) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-4">
            {t('modules.quizComplete')}
          </h2>
          <p className="text-xl text-[rgb(var(--text-secondary))] mb-2">
            {t('modules.scored', { 
              correct: selectedAnswers.filter((a, i) => a === moduleQuizzes[i].correctAnswer).length, 
              total: moduleQuizzes.length 
            })}
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-bold text-[rgb(var(--text-primary))]">{t('modules.pointsEarned', { points: score })}</span>
          </div>
          <button
            onClick={handleBackToModules}
            className="btn-nav-active px-8 py-3"
          >
            {t('modules.backToModules')}
          </button>
        </div>
      </div>
    );
  }

  if (showQuiz && module) {
    const quiz = moduleQuizzes[currentQuestion];
    const hasAnswered = selectedAnswers[currentQuestion] !== undefined;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowQuiz(false)}
              className="btn-nav"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('modules.backToModules')}
            </button>
            <span className="text-sm font-medium text-[rgb(var(--text-secondary))]">
              {t('modules.question', { current: currentQuestion + 1, total: moduleQuizzes.length })}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-6">{quiz.question}</h2>
            <div className="space-y-3">
              {quiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all bg-white/60 dark:bg-white/5 ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 dark:border-white/15 hover:border-blue-300'
                  }`}
                >
                  <span className="font-medium">{option}</span>
                </button>
              ))}
            </div>
          </div>

          {hasAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-2 btn-nav-active px-6 py-3"
              >
                {currentQuestion < moduleQuizzes.length - 1 ? (
                  <>
                    {t('modules.nextQuestion')}
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  t('modules.completeQuiz')
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (module) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBackToModules}
          className="btn-nav mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('modules.backToModules')}
        </button>

        <div className="card mb-6 quiz-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">{module.title}</h1>
              <p className="text-[rgb(var(--text-secondary))]">{module.description}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(module.difficulty)}`}>
              {getDifficultyLabel(module.difficulty)}
            </span>
          </div>

          <div className="prose max-w-none mb-8 text-[rgb(var(--text-primary))]">
            <div dangerouslySetInnerHTML={{ __html: module.content.replace(/\n/g, '<br />') }} />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-white/15">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-[rgb(var(--text-primary))]">
                {t('modules.points', { points: module.pointsReward })} available
              </span>
            </div>
            <button
              onClick={handleStartQuiz}
              className="btn-nav-active px-6 py-3"
            >
              {t('modules.startQuiz')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">{t('modules.title')}</h1>
        <p className="text-[rgb(var(--text-secondary))]">
          {t('modules.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningModules.map((module) => {
          const isCompleted = completedModuleIds.has(module.id);

          return (
            <div
              key={module.id}
              className="card transition-all cursor-pointer overflow-hidden hover:scale-[1.01]"
              onClick={() => setSelectedModule(module.id)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg bg-[rgba(0,0,0,0.06)] dark:bg-white/10">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                </div>

                <h3 className="text-xl font-bold text-[rgb(var(--text-primary))] mb-2">{module.title}</h3>
                <p className="text-[rgb(var(--text-secondary))] text-sm mb-4 line-clamp-2">{module.description}</p>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {getDifficultyLabel(module.difficulty)}
                  </span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                      {t('modules.points', { points: module.pointsReward })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t bg-[rgba(0,0,0,0.04)] border-gray-200 dark:bg-white/5 dark:border-white/15">
                <span className="text-sm text-[rgb(var(--text-secondary))]">
                  {t('modules.quizQuestions', { count: quizzes.filter(q => q.moduleId === module.id || q.moduleId === (module as any).difficulty).length })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
