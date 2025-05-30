"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { translations } from "./translation"; // adjust path if needed

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (path: string) => path,
});

export const useTranslation = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage");
    const allowed = ["en", "hi"];
    if (storedLang && allowed.includes(storedLang)) {
      setLanguage(storedLang);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (path: string): string => {
    const keys = path.split(".");
    let result: any = translations[language] || translations["en"];
    for (const key of keys) {
      if (!result) return path;
      result = result[key];
    }
    return typeof result === "string" ? result : path;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
