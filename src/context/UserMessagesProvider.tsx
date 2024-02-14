import { useState } from "react";
import { UserMessagesContext } from "./UserMessagesContext";

interface UserMessageProviderProps {
  children: React.ReactNode;
}

export const UserMessageProvider = ({ children }: UserMessageProviderProps) => {
  const [messages, setMessages] = useState<UserMessage[]>([]);

  const addMessage = (message: UserMessage) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <UserMessagesContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </UserMessagesContext.Provider>
  );
};