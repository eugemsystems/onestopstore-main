"use client";

import React, { useEffect, useState } from "react";

//internal imports
import { useLanguage } from "@context/LanguageContext";

const SelectLanguage = ({ data, size = "text-sm" }) => {
  const { lang, setLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState({});

  // handle change function
  const handleLanguage = (language) => {
    setLang(language.code); // Update language globally
  };

  // Sync UI with selected language
  useEffect(() => {
    const selectedLang = data?.find((lan) => lan?.code === lang);
    setCurrentLang(selectedLang);
  }, [data, lang]);

  return (
    <div className="relative group">
      {/* Trigger */}
      <button className={`flex items-center justify-center ${size}`}>
        <span className="font-medium hover:text-primary items-center flex gap-1">
          <div>{currentLang?.flag}</div>
          <span className="truncate max-w-[80px]">{currentLang?.name}</span>
          <svg
            className="ml-0.5 h-3 w-3 group-hover:rotate-180 transition-transform duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>

      {/* Hover dropdown panel */}
      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute right-0 top-full pt-2 z-50 transition-all duration-200 ease-in-out">
        <div className="w-40 origin-top-right rounded-lg bg-card py-2 shadow-xl ring-1 ring-border">
          {data?.map((language, index) => (
            <div
              key={language?.name + index + 1}
              className="px-6 py-1 hover:bg-accent"
            >
              <div className="w-full flex">
                <button
                  onClick={() => handleLanguage(language)}
                  className="flex gap-4 justify-between px-3 py-0.5 text-sm leading-6 text-foreground hover:text-primary"
                >
                  <div>{language?.flag}</div>
                  <div>{language?.name}</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectLanguage;
