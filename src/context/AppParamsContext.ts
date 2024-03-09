import {createContext} from 'react';

export const AppParamsContext = createContext<AppParams>(
  {
    pageTitle: 'SAWC',
    setPageTitle: () => {}
  }
);