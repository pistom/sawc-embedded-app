
  type Message =  {
    device: string;
    output: string;
    status: string;
    duration: number;
    message?: string;
  }

  type RemainingTimesMessage = Message & {
    remainingTimes: { [key: string]: { wateringTime: number, wateringIn: number, wateringVolume: number } };
  }

  type ConfigMessage = Message & {
    config: Config;
  }

  type CalibrationMessage = Message & {
    ratio: number;
  }
