type Output = {
  [key: string]: OutputConfig;
};

type OutputConfig = {
  pin: number;
  id: string;
};

type Output = {
  [key: string]: string;
};

type Device = {
  name: string;
  outputs: Output;
  id?: string;
  type: string;
};

type Config = {
  devices: {
    [key: string]: Device;
  };
};

type DeviceConfig = {
  name: string;
  outputs: OutputConfig[];
  inputs?: unknown;
  id: string;
};
