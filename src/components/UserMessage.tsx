import { useContext } from "react";
import { UserMessagesContext } from "../context/UserMessagesContext";
import { XCircleIcon } from "@heroicons/react/24/outline";
import './userMessage.css';


const UserMessage = () => {
  const userMessagesContext = useContext(UserMessagesContext);
  const { messages, clearMessages } = userMessagesContext;


  return (<>
    {messages.length > 0 &&
      <div className="fixed bg-white right-0 left-0 top-0 z-10 shadow-2xl">
        <span className="absolute top-3 right-3 cursor-pointer" onClick={clearMessages}><XCircleIcon className="h-5 w-5" /></span>
        {messages.map((message: UserMessage, index: number) => (
          <div key={`message-${index}`} className={`p-2 userMessage-${message.type}`}>
            <h3 className="text-lg leading-6 font-medium">
              {message.title}
            </h3>
            <div className="mt-2 text-sm">
              <p>
                {message.message}
              </p>
            </div>
          </div>
        ))}
      </div>}
  </>);
}

export default UserMessage;