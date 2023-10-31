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
          .filter((output: { pin: number, id: string }) => output.id !== 'pump')
          .filter((output) => !output.disabled)
      }
    });
  return devices;
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
