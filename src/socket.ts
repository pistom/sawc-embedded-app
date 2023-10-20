import { io, Socket } from 'socket.io-client';

export default io(`${window.location.hostname}:3001`) as Socket;