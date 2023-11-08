import { useEffect, useState } from "react";
import { sleep } from "../helpers/config";

const fetchConfig = async (): Promise<Config | null> => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3001/config`
      , {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    if (!response.ok) {
      if (response.status === 401) {
        if (window.location.pathname === '/preferences') return null;
        window.location.href = '/preferences';
      } else {
        throw new Error(response.statusText);
      }
    }
    const data = await response.json();
    return data.config;
  } catch (error) {
    await sleep(3000);
    console.log(`Retreiving config failed, retrying in 3 seconds...`);
  }
  return await fetchConfig();
};

export function useFetchConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
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
  }, []);
  return [config, setConfig, error] as const;
}