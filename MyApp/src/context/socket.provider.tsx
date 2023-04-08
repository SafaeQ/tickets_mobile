import {io} from 'socket.io-client';

const SOCKET_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://10.192.0.19:4000'
    : 'http://65.108.50.157:4001';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
});
