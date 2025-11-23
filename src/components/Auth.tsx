import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Check, X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { validateUsername, validateEmail, validatePassword } from '../utils/validationTest';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const { user, login, register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/app/dashboard');
    }
  }, [user, navigate]);

  // Update password strength in real-time
  useEffect(() => {
    if (!isLogin && password) {
      const result = validatePassword(password);
      setPasswordStrength(result.strength);
    } else {
      setPasswordStrength(null);
    }
  }, [password, isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        // Validate login credentials
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setValidationErrors({ email: emailValidation.errors });
          setIsLoading(false);
          return;
        }
        await login(email, password);
      } else {
        // Validate registration data
        const usernameValidation = validateUsername(username);
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);

        const errors: Record<string, string[]> = {};

        if (!usernameValidation.isValid) {
          errors.username = usernameValidation.errors;
        }
        if (!emailValidation.isValid) {
          errors.email = emailValidation.errors;
        }
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors;
        }

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          setIsLoading(false);
          return;
        }

        await register(username, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-orange-400';
      case 3: return 'bg-yellow-400';
      case 4: return 'bg-green-400';
      case 5: return 'bg-green-600';
      default: return 'bg-gray-200';
    }
  };



  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {met ? <Check className="w-3 h-3 mr-1.5" /> : <div className="w-3 h-3 mr-1.5 rounded-full border border-gray-400" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-white to-white dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md perspective-1000">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 transition-all duration-300 hover:shadow-blue-500/10">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-500 p-4 rounded-2xl shadow-lg shadow-blue-500/30 mb-6 transform transition-transform hover:scale-105 duration-300">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">
              {t('app.name')}
            </h1>
            <p className="text-center text-gray-500 dark:text-gray-400 font-medium">
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                  {t('auth.username')}
                </label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (validationErrors.username) {
                        setValidationErrors(prev => ({ ...prev, username: [] }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none ${validationErrors.username
                      ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                      : 'border-gray-200 dark:border-gray-700'
                      } text-gray-900 dark:text-white placeholder-gray-400`}
                    placeholder={t('auth.usernamePlaceholder')}
                    required={!isLogin}
                  />
                </div>
                {validationErrors.username && (
                  <div className="text-xs text-red-500 ml-1 animate-fadeIn">
                    {validationErrors.username[0]}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                {t('auth.email')}
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: [] }));
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none ${validationErrors.email
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                    } text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="text-xs text-red-500 ml-1 animate-fadeIn">
                  {validationErrors.email[0]}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
                {t('auth.password')}
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: [] }));
                    }
                  }}
                  className={`w-full pl-10 pr-12 py-3.5 bg-gray-50 dark:bg-gray-800/50 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 outline-none ${validationErrors.password
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-gray-200 dark:border-gray-700'
                    } text-gray-900 dark:text-white placeholder-gray-400`}
                  placeholder={t('auth.passwordPlaceholder')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Strength Meter & Requirements */}
              {!isLogin && password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50 space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                      <span>Strength</span>
                      <span className={passwordStrength?.level >= 4 ? 'text-green-600' : passwordStrength?.level >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {passwordStrength?.description}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${getStrengthColor(passwordStrength?.level || 0)}`}
                        style={{ width: `${((passwordStrength?.level || 0) / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <PasswordRequirement met={password.length >= 8} text="8+ characters" />
                    <PasswordRequirement met={/[A-Z]/.test(password)} text="Uppercase letter" />
                    <PasswordRequirement met={/[a-z]/.test(password)} text="Lowercase letter" />
                    <PasswordRequirement met={/\d/.test(password)} text="Number" />
                    <PasswordRequirement met={/[!@#$%^&*(),.?":{}|<>]/.test(password)} text="Special char" />
                  </div>
                </div>
              )}

              {validationErrors.password && isLogin && (
                <div className="text-xs text-red-500 ml-1 animate-fadeIn">
                  {validationErrors.password[0]}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start animate-fadeIn">
                <X className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('auth.signIn') : t('auth.signUp')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setValidationErrors({});
                setPassword('');
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm hover:underline transition-all"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
