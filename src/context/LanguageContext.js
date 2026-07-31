import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(Cookies.get("_lang") || "en");

  useEffect(() => {
    Cookies.set("_lang", lang, { sameSite: "None", secure: true });
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  return context || { lang: "en", setLang: () => {} };
};
