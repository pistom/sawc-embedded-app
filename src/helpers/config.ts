export const getWateringDevicesFromConfig = (config: Config): DeviceConfig[] => {
  const devices = Object.keys(config.devices)
    .filter((device: string) => config.devices[device].type === 'MCP23017')
    .map((device: string) => {
      return {
        ...config.devices[device],
        id: device,
        outputs: Object.keys(config.devices[device].outputs)
          .map((output: string) => (
            {
              ...config.devices[device].outputs[output],
              id: output,
            }
          ))
          .filter((output: { pin: number, id: string }) => output.id !== 'pump'),
      }
    });
  return devices;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchConfig = async (): Promise<Config> => {
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