import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  showLabel = false 
}) => {
  const { language, setLanguage, t, isVoiceSupported, voiceEnabled, toggleVoice } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('common.language')}
        </label>
      )}
      
      <div className="flex items-center space-x-2">
        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            title={t('common.selectLanguage')}
          >
            <span className="text-lg">{currentLanguage?.flag}</span>
            <span className="text-sm font-medium text-gray-900">
              {currentLanguage?.nativeName}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              <div className="py-1" role="listbox">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    role="option"
                    aria-selected={language === lang.code}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{lang.nativeName}</span>
                      <span className="text-xs text-gray-500">{lang.name}</span>
                    </div>
                    {language === lang.code && (
                      <svg className="w-4 h-4 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Voice Toggle Button */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2 rounded-lg border transition-colors ${
              voiceEnabled
                ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-gray-200'
            }`}
            title={voiceEnabled ? t('common.disableVoice') : t('common.enableVoice')}
            aria-label={voiceEnabled ? t('common.disableVoice') : t('common.enableVoice')}
          >
            {voiceEnabled ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 6.5v11M8 12l4 4 4-4" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

// Compact version for navigation bar
export const CompactLanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en' as Language, flag: '🇺🇸', name: 'EN' },
    { code: 'hi' as Language, flag: '🇮🇳', name: 'हि' },
    { code: 'pa' as Language, flag: '🇮🇳', name: 'ਪੰ' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 text-sm bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
      >
        <span>{currentLanguage?.flag}</span>
        <span className="text-white font-medium">{currentLanguage?.name}</span>
        <svg className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-50 ${
                language === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Hook for speech button component
export const SpeechButton: React.FC<{
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ text, className = '', size = 'md' }) => {
  const { speak, isVoiceSupported, voiceEnabled } = useLanguage();

  if (!isVoiceSupported || !voiceEnabled) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  return (
    <button
      type="button"
      onClick={() => speak(text)}
      className={`inline-flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${buttonSizeClasses[size]} ${className}`}
      title="Listen to this text"
      aria-label="Listen to this text"
    >
      <svg className={sizeClasses[size]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 6.5v11" />
      </svg>
    </button>
  );
};

export default LanguageSelector;
