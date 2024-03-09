import { useState } from "react";
import { AppParamsContext } from "./AppParamsContext";

interface AppParamsProviderProps {
  children: React.ReactNode;
}

export const AppParamsProvider = ({ children }: AppParamsProviderProps) => {
  const [pageTitle, setPageTitle] = useState('SAWC');

  return (
    <AppParamsContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </AppParamsContext.Provider>
  );
};