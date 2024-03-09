import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export function useSocket(socket: Socket) {
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    socket.on('welcome_message', (data) => {
      if (data.status === 'error') {
        setError(new Error(data.message));
      }
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('welcome_message');
      setConnected(false);
      setError(null);
    };
  }, [socket]);

  return [connected, error];
}