import { useCallback, useState } from "react";
import { UserMessagesContext } from "./UserMessagesContext";

interface UserMessageProviderProps {
  children: React.ReactNode;
}

export const UserMessageProvider = ({ children }: UserMessageProviderProps) => {
  const [messages, setMessages] = useState<UserMessage[]>([]);

  const addMessage = useCallback((message: UserMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <UserMessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </UserMessagesContext.Provider>
  );
};