import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'pa'; // English, Hindi, Punjabi

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
  speak: (text: string) => void;
  isVoiceSupported: boolean;
  voiceEnabled: boolean;
  toggleVoice: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation data structure
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.retry': 'Retry',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.modules': 'Learning Modules',
    'nav.drills': 'Virtual Drills',
    'nav.badges': 'Badges',
    'nav.leaderboard': 'Leaderboard',
    'nav.emergency': 'Emergency Contacts',
    'nav.alerts': 'Hazard Alerts',
    'nav.profile': 'Profile',
    'nav.admin': 'Admin Panel',
    'nav.family': 'Family Dashboard',
    'nav.logout': 'Logout',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.name': 'Full Name',
    'auth.role': 'Role',
    'auth.grade': 'Grade',
    'auth.school': 'School',
    'auth.district': 'District',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.loginSuccess': 'Login successful!',
    'auth.registrationSuccess': 'Registration successful!',
    'auth.loginError': 'Login failed. Please check your credentials.',
    'auth.registrationError': 'Registration failed. Please try again.',
    
    // Dashboard
    'dashboard.welcome': 'Welcome, {{name}}',
    'dashboard.overallProgress': 'Overall Progress',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.statistics': 'Statistics',
    'dashboard.modulesCompleted': 'Modules Completed',
    'dashboard.drillsCompleted': 'Drills Completed',
    'dashboard.badgesEarned': 'Badges Earned',
    'dashboard.averageScore': 'Average Score',
    
    // Modules
    'modules.title': 'Disaster Preparedness Modules',
    'modules.startLearning': 'Start Learning',
    'modules.continueModule': 'Continue Module',
    'modules.completed': 'Completed',
    'modules.inProgress': 'In Progress',
    'modules.locked': 'Locked',
    'modules.estimatedTime': 'Estimated Time',
    'modules.difficulty': 'Difficulty',
    'modules.topics': 'Topics Covered',
    'modules.quiz': 'Take Quiz',
    'modules.score': 'Score: {{score}}%',
    
    // Drills
    'drills.title': 'Virtual Emergency Drills',
    'drills.startDrill': 'Start Drill',
    'drills.evacuationDrill': 'Evacuation Drill',
    'drills.fireEmergency': 'Fire Emergency',
    'drills.earthquakeDrill': 'Earthquake Response',
    'drills.floodResponse': 'Flood Response',
    'drills.completionTime': 'Completion Time',
    'drills.bestTime': 'Best Time',
    'drills.instructions': 'Follow the evacuation route and complete each step',
    
    // Emergency
    'emergency.contacts': 'Emergency Contacts',
    'emergency.call': 'Call',
    'emergency.sms': 'Send SMS',
    'emergency.police': 'Police',
    'emergency.fire': 'Fire Department',
    'emergency.medical': 'Medical Emergency',
    'emergency.disaster': 'Disaster Management',
    'emergency.reportIncident': 'Report Incident',
    
    // Alerts
    'alerts.hazardAlerts': 'Hazard Alerts',
    'alerts.weatherUpdate': 'Weather Update',
    'alerts.emergencyAlert': 'Emergency Alert',
    'alerts.noAlerts': 'No active alerts',
    'alerts.severity.low': 'Low',
    'alerts.severity.medium': 'Medium',
    'alerts.severity.high': 'High',
    'alerts.severity.critical': 'Critical',
    
    // Family Dashboard
    'family.dashboard': 'Family Dashboard',
    'family.linkChild': 'Link Child Account',
    'family.childProgress': 'Child Progress',
    'family.overallStats': 'Overall Family Statistics',
    'family.recentAchievements': 'Recent Achievements',
    'family.viewDetails': 'View Details',
    'family.settings': 'Settings',
    'family.emergencyContacts': 'Emergency Contacts',
    
    // Disaster Types
    'disasters.earthquake': 'Earthquake',
    'disasters.flood': 'Flood',
    'disasters.fire': 'Fire',
    'disasters.cyclone': 'Cyclone',
    'disasters.drought': 'Drought',
    'disasters.heatwave': 'Heatwave',
    'disasters.landslide': 'Landslide',
    'disasters.thunderstorm': 'Thunderstorm',
    
    // Punjab Districts
    'districts.amritsar': 'Amritsar',
    'districts.ludhiana': 'Ludhiana',
    'districts.jalandhar': 'Jalandhar',
    'districts.patiala': 'Patiala',
    'districts.bathinda': 'Bathinda',
    'districts.mohali': 'Mohali',
    'districts.ferozepur': 'Ferozepur',
    'districts.gurdaspur': 'Gurdaspur',
    'districts.hoshiarpur': 'Hoshiarpur',
    'districts.kapurthala': 'Kapurthala',
  },
  
  hi: {
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.submit': 'जमा करें',
    'common.retry': 'फिर से प्रयास करें',
    
    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.modules': 'सीखने के मॉड्यूल',
    'nav.drills': 'आभासी अभ्यास',
    'nav.badges': 'बैज',
    'nav.leaderboard': 'लीडरबोर्ड',
    'nav.emergency': 'आपातकालीन संपर्क',
    'nav.alerts': 'खतरा अलर्ट',
    'nav.profile': 'प्रोफाइल',
    'nav.admin': 'एडमिन पैनल',
    'nav.family': 'पारिवारिक डैशबोर्ड',
    'nav.logout': 'लॉगआउट',
    
    // Authentication
    'auth.login': 'लॉगिन',
    'auth.register': 'रजिस्टर',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.confirmPassword': 'पासवर्ड की पुष्टि करें',
    'auth.name': 'पूरा नाम',
    'auth.role': 'भूमिका',
    'auth.grade': 'कक्षा',
    'auth.school': 'स्कूल',
    'auth.district': 'जिला',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.loginSuccess': 'सफल लॉगिन!',
    'auth.registrationSuccess': 'सफल पंजीकरण!',
    'auth.loginError': 'लॉगिन विफल। कृपया अपनी प्रमाणपत्र जांचें।',
    'auth.registrationError': 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
    
    // Dashboard
    'dashboard.welcome': 'स्वागत है, {{name}}',
    'dashboard.overallProgress': 'कुल प्रगति',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.statistics': 'आंकड़े',
    'dashboard.modulesCompleted': 'पूर्ण मॉड्यूल',
    'dashboard.drillsCompleted': 'पूर्ण अभ्यास',
    'dashboard.badgesEarned': 'अर्जित बैज',
    'dashboard.averageScore': 'औसत स्कोर',
    
    // Modules
    'modules.title': 'आपदा तैयारी मॉड्यूल',
    'modules.startLearning': 'सीखना शुरू करें',
    'modules.continueModule': 'मॉड्यूल जारी रखें',
    'modules.completed': 'पूर्ण',
    'modules.inProgress': 'प्रगति में',
    'modules.locked': 'लॉक',
    'modules.estimatedTime': 'अनुमानित समय',
    'modules.difficulty': 'कठिनाई',
    'modules.topics': 'कवर किए गए विषय',
    'modules.quiz': 'क्विज लें',
    'modules.score': 'स्कोर: {{score}}%',
    
    // Disasters
    'disasters.earthquake': 'भूकंप',
    'disasters.flood': 'बाढ़',
    'disasters.fire': 'आग',
    'disasters.cyclone': 'चक्रवात',
    'disasters.drought': 'सूखा',
    'disasters.heatwave': 'लू',
    'disasters.landslide': 'भूस्खलन',
    'disasters.thunderstorm': 'तूफान',
  },
  
  pa: {
    // Common - Punjabi (Gurmukhi script)
    'common.loading': 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    'common.error': 'ਗਲਤੀ',
    'common.success': 'ਸਫਲਤਾ',
    'common.cancel': 'ਰੱਦ ਕਰੋ',
    'common.save': 'ਸੇਵ ਕਰੋ',
    'common.delete': 'ਮਿਟਾਓ',
    'common.edit': 'ਸੰਪਾਦਿਤ ਕਰੋ',
    'common.view': 'ਦੇਖੋ',
    'common.back': 'ਵਾਪਸ',
    'common.next': 'ਅਗਲਾ',
    'common.previous': 'ਪਿਛਲਾ',
    'common.submit': 'ਜਮ੍ਹਾਂ ਕਰੋ',
    'common.retry': 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    
    // Navigation
    'nav.dashboard': 'ਡੈਸ਼ਬੋਰਡ',
    'nav.modules': 'ਸਿੱਖਿਆ ਮੋਡੂਲ',
    'nav.drills': 'ਵਰਚੁਅਲ ਅਭਿਆਸ',
    'nav.badges': 'ਬੈਜ',
    'nav.leaderboard': 'ਲੀਡਰਬੋਰਡ',
    'nav.emergency': 'ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ',
    'nav.alerts': 'ਖਤਰਾ ਅਲਰਟ',
    'nav.profile': 'ਪ੍ਰੋਫਾਈਲ',
    'nav.admin': 'ਐਡਮਿਨ ਪੈਨਲ',
    'nav.family': 'ਪਰਿਵਾਰਕ ਡੈਸ਼ਬੋਰਡ',
    'nav.logout': 'ਲੌਗਆਉਟ',
    
    // Authentication
    'auth.login': 'ਲੌਗਇਨ',
    'auth.register': 'ਰਜਿਸਟਰ',
    'auth.email': 'ਈਮੇਲ',
    'auth.password': 'ਪਾਸਵਰਡ',
    'auth.confirmPassword': 'ਪਾਸਵਰਡ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ',
    'auth.name': 'ਪੂਰਾ ਨਾਮ',
    'auth.role': 'ਭੂਮਿਕਾ',
    'auth.grade': 'ਜਮਾਤ',
    'auth.school': 'ਸਕੂਲ',
    'auth.district': 'ਜ਼ਿਲ੍ਹਾ',
    'auth.forgotPassword': 'ਪਾਸਵਰਡ ਭੁੱਲ ਗਏ?',
    'auth.loginSuccess': 'ਸਫਲ ਲੌਗਇਨ!',
    'auth.registrationSuccess': 'ਸਫਲ ਰਜਿਸਟ੍ਰੇਸ਼ਨ!',
    'auth.loginError': 'ਲੌਗਇਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਪ੍ਰਮਾਣ ਪੱਤਰ ਜਾਂਚੋ।',
    'auth.registrationError': 'ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    
    // Dashboard
    'dashboard.welcome': 'ਜੀ ਆਇਆਂ ਨੂੰ, {{name}}',
    'dashboard.overallProgress': 'ਕੁੱਲ ਪ੍ਰਗਤੀ',
    'dashboard.recentActivity': 'ਹਾਲੀਆ ਗਤੀਵਿਧੀ',
    'dashboard.quickActions': 'ਤੁਰੰਤ ਕਾਰਵਾਈਆਂ',
    'dashboard.statistics': 'ਅੰਕੜੇ',
    'dashboard.modulesCompleted': 'ਪੂਰੇ ਮੋਡੂਲ',
    'dashboard.drillsCompleted': 'ਪੂਰੇ ਅਭਿਆਸ',
    'dashboard.badgesEarned': 'ਕਮਾਏ ਬੈਜ',
    'dashboard.averageScore': 'ਔਸਤ ਸਕੋਰ',
    
    // Modules
    'modules.title': 'ਆਪਦਾ ਤਿਆਰੀ ਮੋਡੂਲ',
    'modules.startLearning': 'ਸਿੱਖਣਾ ਸ਼ੁਰੂ ਕਰੋ',
    'modules.continueModule': 'ਮੋਡੂਲ ਜਾਰੀ ਰੱਖੋ',
    'modules.completed': 'ਪੂਰਾ',
    'modules.inProgress': 'ਪ੍ਰਗਤੀ ਵਿੱਚ',
    'modules.locked': 'ਲਾਕ',
    'modules.estimatedTime': 'ਅਨੁਮਾਨਿਤ ਸਮਾਂ',
    'modules.difficulty': 'ਮੁਸ਼ਕਲ',
    'modules.topics': 'ਕਵਰ ਕੀਤੇ ਵਿਸ਼ੇ',
    'modules.quiz': 'ਕੁਇਜ਼ ਲਓ',
    'modules.score': 'ਸਕੋਰ: {{score}}%',
    
    // Disasters
    'disasters.earthquake': 'ਭੁਚਾਲ',
    'disasters.flood': 'ਹੜ੍ਹ',
    'disasters.fire': 'ਅੱਗ',
    'disasters.cyclone': 'ਚੱਕਰਵਾਤ',
    'disasters.drought': 'ਸੋਕਾ',
    'disasters.heatwave': 'ਗਰਮੀ ਦੀ ਲਹਿਰ',
    'disasters.landslide': 'ਜ਼ਮੀਨ ਖਿਸਕਣਾ',
    'disasters.thunderstorm': 'ਤੂਫਾਨ',
    
    // Punjab Districts
    'districts.amritsar': 'ਅੰਮ੍ਰਿਤਸਰ',
    'districts.ludhiana': 'ਲੁਧਿਆਣਾ',
    'districts.jalandhar': 'ਜਲੰਧਰ',
    'districts.patiala': 'ਪਟਿਆਲਾ',
    'districts.bathinda': 'ਬਠਿੰਡਾ',
    'districts.mohali': 'ਮੁਹਾਲੀ',
    'districts.ferozepur': 'ਫਿਰੋਜ਼ਪੁਰ',
    'districts.gurdaspur': 'ਗੁਰਦਾਸਪੁਰ',
    'districts.hoshiarpur': 'ਹੁਸ਼ਿਆਰਪੁਰ',
    'districts.kapurthala': 'ਕਪੂਰਥਲਾ',
  }
};

// Voice synthesis settings for different languages
const voiceSettings: Record<Language, { lang: string; pitch: number; rate: number }> = {
  en: { lang: 'en-US', pitch: 1, rate: 1 },
  hi: { lang: 'hi-IN', pitch: 1, rate: 0.9 },
  pa: { lang: 'pa-IN', pitch: 1, rate: 0.8 }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved as Language) || 'en';
  });
  
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('voice-enabled') === 'true';
  });

  const [isVoiceSupported, setIsVoiceSupported] = useState(false);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsVoiceSupported('speechSynthesis' in window);
  }, []);

  useEffect(() => {
    localStorage.setItem('preferred-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('voice-enabled', voiceEnabled.toString());
  }, [voiceEnabled]);

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || translations.en[key] || key;
    
    // Replace parameters in translation
    if (params) {
      Object.keys(params).forEach(paramKey => {
        translation = translation.replace(`{{${paramKey}}}`, params[paramKey]);
      });
    }
    
    return translation;
  };

  const speak = (text: string) => {
    if (!isVoiceSupported || !voiceEnabled) return;
    
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      const settings = voiceSettings[language];
      
      utterance.lang = settings.lang;
      utterance.pitch = settings.pitch;
      utterance.rate = settings.rate;
      utterance.volume = 0.8;
      
      // Try to find a voice that matches the language
      const voices = speechSynthesis.getVoices();
      const matchingVoice = voices.find(voice => 
        voice.lang.startsWith(settings.lang.split('-')[0])
      );
      
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
      
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    speak,
    isVoiceSupported,
    voiceEnabled,
    toggleVoice
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Hook for translating and speaking text
export const useTranslateAndSpeak = () => {
  const { t, speak } = useLanguage();
  
  const translateAndSpeak = (key: string, params?: Record<string, string>) => {
    const text = t(key, params);
    speak(text);
    return text;
  };
  
  return { translateAndSpeak, t, speak };
};
