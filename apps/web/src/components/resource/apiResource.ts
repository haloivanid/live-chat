import { IApiGetMessages } from '@/types/message.types';
import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios } from 'axios-hooks';
import { LRUCache } from 'lru-cache';

interface IOpts<D = Record<string, any>> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  params?: Record<string, any>;
  data?: D;
}

const createAxiosConfig = (opts: IOpts): AxiosRequestConfig => ({
  baseURL: '/api',
  timeout: 20 * 1000,
  headers: {
    'Content-Type': 'application/json',
  },
  method: opts.method,
  url: opts.path,
  params: opts.params,
  data: opts.data,
});

const adapter = axios.create({ timeout: 20 * 1000 });
const cache = new LRUCache({ max: 20, updateAgeOnGet: true, ttl: 5 * 60 * 1000 });

export const useApiPostUser = (username: string) => {
  return makeUseAxios({
    axios: adapter,
    cache,
  })<{ id: number; username: string }>(
    createAxiosConfig({
      method: 'POST',
      path: '/users',
      data: { username },
    }),
  );
};

export const useApiGetMessages = (roomId: string, { page: page = 1, limit: limit = 25 }) => {
  return makeUseAxios({
    axios: adapter,
    cache,
  })<IApiGetMessages>(
    createAxiosConfig({
      method: 'GET',
      path: `/rooms/${roomId}/messages`,
      params: { page, limit },
    }),
    {},
  );
};

export const useApiPostMessage = (roomId: string, userId: number, message: string) => {
  return makeUseAxios({
    axios: adapter,
    cache,
  })<null>(
    createAxiosConfig({
      method: 'POST',
      path: `/rooms/${roomId}/messages`,
      data: { user_id: userId, message },
    }),
    { manual: true },
  );
};
