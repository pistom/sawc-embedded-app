import { Manager } from 'socket.io-client';

const manager = new Manager(`http://${window.location.hostname}:3001`);

const socket = manager.socket("/", {
  auth: {
    token: window.localStorage.getItem("token"),
  }
});

export default socket;