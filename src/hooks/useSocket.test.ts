import { renderHook } from '@testing-library/react-hooks';
import { useSocket } from './useSocket';
import { io } from 'socket.io-client';

describe('useSocket', () => {
  test('it listens for connect and disconnect events on the socket', () => {
    const socket = io('http://localhost:3000');
    renderHook(() => useSocket(socket))
  });

});