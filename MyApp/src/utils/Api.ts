import axios from 'axios';

export const baseURL =
  process.env.NODE_ENV === 'development'
    ? 'http://10.192.0.19:4001/api'
    : 'http://65.108.50.157:4001/api';

const transport = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});
export default transport;
