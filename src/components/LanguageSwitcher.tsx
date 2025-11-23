import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 min-w-[120px] justify-between"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4" />
          <span className="text-lg leading-none">{currentLanguage.flag}</span>
          <span className="hidden sm:inline text-sm font-medium">{currentLanguage.nativeName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                Select Language
              </div>
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between transition-colors duration-150 ${i18n.language === language.code ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{language.flag}</span>
                    <div>
                      <div className={`font-medium ${i18n.language === language.code
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-slate-900 dark:text-white'
                        }`}>
                        {language.nativeName}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{language.name}</div>
                    </div>
                  </div>
                  {i18n.language === language.code && (
                    <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              Language preference is saved automatically
            </div>
          </div>
        </>
      )}
    </div>
  );
}
