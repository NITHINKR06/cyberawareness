import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Check, X, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { validateUsername, validateEmail, validatePassword } from '../utils/validationTest';
import MatrixBackground from './MatrixBackground';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  const { user, login, register } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/app/dashboard');
  }, [user, navigate]);

  // Update password strength in real‑time
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
    setSuccess('');
    setValidationErrors({});
    setIsLoading(true);
    try {
      if (isLogin) {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setValidationErrors({ email: emailValidation.errors });
          return;
        }
        await login(email, password);
      } else {
        const usernameValidation = validateUsername(username);
        const emailValidation = validateEmail(email);
        const passwordValidation = validatePassword(password);
        const errors: Record<string, string[]> = {};
        if (!usernameValidation.isValid) errors.username = usernameValidation.errors;
        if (!emailValidation.isValid) errors.email = emailValidation.errors;
        if (!passwordValidation.isValid) errors.password = passwordValidation.errors;
        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
        await register(username, email, password);
        // Show success message about email verification
        setSuccess('Registration successful! Please check your email to verify your account. Email verification helps prevent fake accounts.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-red-500';
      case 1:
        return 'bg-red-400';
      case 2:
        return 'bg-orange-400';
      case 3:
        return 'bg-yellow-400';
      case 4:
        return 'bg-slate-500';
      case 5:
        return 'bg-slate-600';
      default:
        return 'bg-gray-200';
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${met ? 'text-slate-400' : 'text-gray-500'}`}>
      {met ? <Check className="w-3 h-3 mr-1.5" /> : <div className="w-3 h-3 mr-1.5 rounded-full border border-gray-500" />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <MatrixBackground />
      <div className="w-full max-w-md perspective-1000 z-10">
        <div
          className="bg-black/70 backdrop-blur-xl rounded-3xl border border-slate-500/30 shadow-2xl p-8"
          style={{ backgroundImage: 'linear-gradient(135deg, rgba(51,65,85,0.4), rgba(71,85,105,0.6))' }}
        >
          <h1
            className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-300 font-mono"
            style={{ textShadow: '0 0 8px #94a3b8, 0 0 12px #94a3b8' }}
          >
            {t('app.name')}
          </h1>
          <p
            className="text-center text-slate-400 font-mono text-sm mt-2"
            style={{ textShadow: '0 0 4px #94a3b8' }}
          >
            {isLogin ? 'ACCESS_GRANTED' : 'INITIATE_SEQUENCE'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* Username – only for sign‑up */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-300">{t('auth.username')}</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (validationErrors.username) setValidationErrors(prev => ({ ...prev, username: [] }));
                    }}
                    className={`w-full pl-10 pr-4 py-3.5 bg-black/50 border rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none font-mono ${validationErrors.username ? 'border-red-500 text-red-400' : 'border-slate-900/50 text-slate-300'} placeholder-slate-500`}
                    placeholder="USERNAME"
                    required
                  />
                </div>
                {validationErrors.username && (
                  <div className="text-xs text-red-500 font-mono">{validationErrors.username[0]}</div>
                )}
              </div>
            )}
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">{t('auth.email')}</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: [] }));
                  }}
                  className={`w-full pl-10 pr-4 py-3.5 bg-black/50 border rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none font-mono ${validationErrors.email ? 'border-red-500 text-red-400' : 'border-slate-900/50 text-slate-300'} placeholder-slate-500`}
                  placeholder="EMAIL_ADDRESS"
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="text-xs text-red-500 font-mono">{validationErrors.email[0]}</div>
              )}
            </div>
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-slate-300">{t('auth.password')}</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-600 group-focus-within:text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: [] }));
                  }}
                  className={`w-full pl-10 pr-12 py-3.5 bg-black/50 border rounded-xl focus:ring-1 focus:ring-slate-400 focus:border-slate-400 outline-none font-mono ${validationErrors.password ? 'border-red-500 text-red-400' : 'border-slate-900/50 text-slate-300'} placeholder-slate-500`}
                  placeholder="PASSWORD"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength & requirements – only on sign‑up */}
              {!isLogin && password && (
                <div className="mt-3 p-3 bg-black/40 rounded-lg border border-slate-900/30 space-y-3">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>STRENGTH_ANALYSIS</span>
                    <span className={passwordStrength?.level >= 4 ? 'text-slate-400' : passwordStrength?.level >= 2 ? 'text-yellow-500' : 'text-red-500'}>
                      {passwordStrength?.description.toUpperCase()}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-900/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${getStrengthColor(passwordStrength?.level || 0)}`}
                      style={{ width: `${((passwordStrength?.level || 0) / 5) * 100}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <PasswordRequirement met={password.length >= 8} text="LENGTH ≥ 8" />
                    <PasswordRequirement met={/[A-Z]/.test(password)} text="UPPERCASE" />
                    <PasswordRequirement met={/[a-z]/.test(password)} text="LOWERCASE" />
                    <PasswordRequirement met={/\d/.test(password)} text="NUMERIC" />
                    <PasswordRequirement met={/[!@#$%^&*(),.?\":{}|<>]/.test(password)} text="SPECIAL" />
                  </div>
                </div>
              )}
              {validationErrors.password && (
                <div className="text-xs text-red-500 font-mono mt-1">{validationErrors.password[0]}</div>
              )}
            </div>
            {/* Server error */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start font-mono">
                <X className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-900/20 border border-green-800/50 text-green-400 px-4 py-3 rounded-xl text-sm flex items-start font-mono">
                <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold mb-1">{success}</p>
                  <p className="text-xs text-green-300/80">
                    This helps prevent fake accounts and ensures account security. You can still use text analysis without verification, but URL analysis requires a verified account.
                  </p>
                </div>
              </div>
            )}
            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black/30 border border-slate-500/70 hover:border-slate-400/90 hover:bg-black/50 text-slate-300 font-bold font-mono py-3.5 rounded-xl shadow-lg shadow-slate-500/30 hover:shadow-slate-400/60 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-slate-300/30 border-t-slate-400 rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'LOGIN' : 'REGISTER'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform text-slate-300" />
                </>
              )}
            </button>
            {/* Toggle login / sign‑up */}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setValidationErrors({});
                  setPassword('');
                }}
                className="text-slate-300 hover:text-slate-400 font-mono text-sm underline transition-colors"
              >
                {isLogin ? 'CREATE_ACCOUNT' : 'ACCESS_LOGIN'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
