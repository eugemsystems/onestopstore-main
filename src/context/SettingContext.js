"use client"; // This context will be used on the client side

import React, { createContext, useContext, useState } from "react";

const SettingContext = createContext(null);

export function useSetting() {
  return useContext(SettingContext);
}

export function SettingProvider({
  initialStoreSetting,
  initialGlobalSetting,
  initialCustomizationSetting,
  children,
}) {
  const [storeSetting, setStoreSetting] = useState(initialStoreSetting);
  const [globalSetting, setGlobalSetting] = useState(initialGlobalSetting);
  const [storeCustomization, setStoreCustomization] = useState(
    initialCustomizationSetting
  );

  // Optional: you can add client side fetching/refetching logic here if needed

  return (
    <SettingContext.Provider
      value={{
        globalSetting,
        setGlobalSetting,
        storeSetting,
        setStoreSetting,
        storeCustomization,
        setStoreCustomization,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
}
