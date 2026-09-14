import { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const LanguageContext = createContext({ lang: "en", setLang: () => {} });

export const LanguageProvider = ({ children }) => {
  // Always start from "en" so the first client render matches the server
  // render exactly (the server has no `document.cookie` to read) — reading
  // the real cookie in the useState initializer, as before, made every
  // translated string (product titles, etc.) hydrate to a mismatch whenever
  // a visitor had a non-English `_lang` cookie set, throwing React errors
  // #418/#425. The persisted choice is applied right after mount instead,
  // mirroring CurrencyContext's identical fix for the same class of bug.
  const [lang, setLang] = useState("en");

  useEffect(() => {
    const saved = Cookies.get("_lang");
    if (saved && saved !== lang) setLang(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
