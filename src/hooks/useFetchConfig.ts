import { useEffect, useState } from "react";
import { SleepInterface, sleep } from "../helpers/config";

let abortController: AbortController | null = null;
let retryDelay: SleepInterface | null = null;

const fetchConfig = async (): Promise<Config | null> => {
  retryDelay = sleep(3);
  try {
    const response = await fetch(`http://${window.location.hostname}:3001/config`
      , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        },
        signal: abortController?.signal
      });
    if (abortController?.signal.aborted) {
      retryDelay.cancel();
      return null;
    }
    if (!response.ok) {
      if (response.status === 401) {
        if (window.location.pathname === '/preferences') return null;
        window.location.href = '/preferences';
      } else {
        throw new Error(response.statusText);
      }
    }
    const data = await response.json();
    retryDelay.cancel();
    return data.config;
  } catch (error) {
    if (!abortController?.signal.aborted) {
      await retryDelay.wait();
      abortController?.abort();
      abortController = new AbortController();
      return await fetchConfig();
    }
  }
  return null;
};

export function useFetchConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    abortController = new AbortController();
    async function fetchConfigData() {
      const config = await fetchConfig();
      if (config) {
        setConfig(config);
        setError(null);
      } else {
        setError(new Error('Unauthorized'));
      }
    }
    fetchConfigData();

    return () => {
      abortController?.abort();
      retryDelay?.cancel();
    }
  }, []);
  return [config, setConfig, error] as const;
}