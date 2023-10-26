import { useEffect, useState } from "react";
import { sleep } from "../helpers/config";

const fetchConfig = async (): Promise<Config> => {
  try {
    const response = await fetch(`http://${window.location.hostname}:3001/config`);
    if (!response.ok) {
      throw new Error(response.statusText);
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
  useEffect(() => {
    async function fetchConfigData() {
      setConfig(await fetchConfig());
    }
    fetchConfigData();
  }, []);
  return [config, setConfig] as const;
}