import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const REQUEST_TIMEOUT = 30000;

export const getApi = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  headers: {
    'x-api-key': API_KEY,
    Accept: 'application/json',
  },
});

export const postApi = (token) =>
  axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });
