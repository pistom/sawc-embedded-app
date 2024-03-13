export const getWateringDevicesFromConfig = (config: Config): DeviceConfig[] => {
  const devices = Object.keys(config.devices)
    .filter((device: string) => config.preferences.wateringDeviceTypes.includes(config.devices[device].type))
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

export interface SleepInterface {
  wait: () => Promise<void>;
  elapsedTime: () => number;
  resume: () => void;
  cancel: () => void;
}

export const sleep = function(duration: number): SleepInterface {
  let timeoutId: NodeJS.Timeout;
  let resolveFunction: (value?: unknown) => void = () => {};
  let rejectFunction: (v?: unknown) => void = () => {};
  const startTime = Date.now();
  const promise = new Promise((resolve, reject) => {
    resolveFunction = resolve;
    rejectFunction = reject;
    timeoutId = setTimeout(resolve, duration * 1000);
  });
  const sleepObject = {
    wait: () => promise as Promise<void>,
    elapsedTime: () => {
      return (Date.now() - startTime) / 1000; // Get the elapsed time
    },
    resume: () => {
      clearTimeout(timeoutId);
      resolveFunction();
    },
    cancel: () => {
      clearTimeout(timeoutId);
      Promise.race([promise]).then(
        () => rejectFunction()
      );
    }
  };
  return sleepObject;
}
