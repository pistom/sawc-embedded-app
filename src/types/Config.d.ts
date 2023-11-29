type Output = {
  [key: string]: OutputConfig;
};

type OutputConfig = {
  pin: number;
  id: string;
  name?: string;
  image?: string;
  defaultVolume?: number; // milliliters
  ratio?: number; // miilliliters per second
  disabled?: boolean;
  onlinePlantsIds?: string[];
  sync?: boolean;
};

type Output = {
  [key: string]: string;
};

type Device = {
  name: string;
  outputs: Output;
  id?: string;
  type: string;
  settings: DeviceSettings;
};

type Config = {
  error?: string;
  preferences: {
    token: string;
    theme: string;
  }
  devices: {
    [key: string]: Device;
  };
};

type DeviceConfig = {
  name: string;
  outputs: OutputConfig[];
  inputs?: unknown;
  id: string;
  settings: DeviceSettings;
};

type DeviceSettings = {
  defaultVolume: number;
  defaultRatio: number;
  maxVolumePerOutput: number;
  calibrateDuration: number;
  disabled?: boolean;
};
