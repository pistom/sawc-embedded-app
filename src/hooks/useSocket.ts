import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";

export function useSocket(socket: Socket) {
  const [connected, setConnected] = useState(socket.connected);
  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => {
      socket.off('connect', () => setConnected(true));
      socket.off('disconnect', () => setConnected(false));
    };
  }, [socket, socket.connected]);

  return connected;
}