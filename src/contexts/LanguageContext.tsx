import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (en: string, pt: string | undefined) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Initialize from localStorage or default to Portuguese (since it's a Portuguese restaurant)
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('namaste-language');
    return (saved as Language) || 'pt';
  });

  // Persist language preference
  useEffect(() => {
    localStorage.setItem('namaste-language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'pt' : 'en'));
  };

  // Helper function to get the correct translation
  // Falls back to English if Portuguese translation is not available
  const t = (en: string, pt: string | undefined): string => {
    if (language === 'pt' && pt) {
      return pt;
    }
    return en;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
