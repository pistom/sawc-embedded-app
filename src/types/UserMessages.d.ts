type UserMessage = {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

type UserMessagesContextType = {
  messages: UserMessage[];
  addMessage: (message: UserMessage) => void;
  clearMessages: () => void;
};