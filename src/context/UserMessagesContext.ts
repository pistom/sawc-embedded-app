import {createContext} from 'react';

export const UserMessagesContext = createContext<UserMessagesContextType>(
  {
    messages: [],
    addMessage: () => {},
    clearMessages: () => {}
  }
);