import { useCallback, useContext } from "react";
import { UserMessagesContext } from '../context/UserMessagesContext';

export function useDisplayErrors() {

  const userMessagesContext = useContext(UserMessagesContext);
  const { addMessage } = userMessagesContext;

  const displayErrors = useCallback((plantMessage: Message) => {
    if (plantMessage.status === "error") {
      switch (plantMessage.context?.errno) {
        case -113:
        case "EHOSTUNREACH":
          addMessage({
            type: 'error',
            title: `Can not reach network module (${plantMessage.context?.address})`,
            message: 'Check that the device is switched on and properly configured.'
          });
          break;
        case -123:
          addMessage({
            type: 'error',
            title: `Output number not found (${plantMessage.device}, output: ${plantMessage.output})`,
            message: 'Check the device configuration.'
          });
          break;
        case "INVALIDTOKEN":
          addMessage({
            type: 'error',
            title: `Invalid token`,
            message: 'Check the device configuration.'
          });
          break;
      }
    }
  }, [addMessage]);

  return displayErrors;
}