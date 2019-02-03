import { useState } from 'react';

const memoryStorage = new Map<string, string>();

const ls = {
  get: (key: string) => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return memoryStorage.get(key) || null;
  },
  set: (key: string, value: string | null) => {
    if (typeof localStorage !== 'undefined') {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    }
    if (value === null) {
      memoryStorage.delete(key);
    } else {
      memoryStorage.set(key, value);
    }
  },
};

export function useLocalStorage(key: string): [string | null, (value: string | null) => void] {
  const [state, setState] = useState<string | null>(ls.get(key));
  return [
    state,
    (value: string | null) => {
      ls.set(key, value);
      setState(value);
    },
  ];
}
