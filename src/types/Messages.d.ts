
  type Message =  {
    device: string;
    output: string;
    status: string;
    duration: number;
  }

  type RemainingTimesMessage = Message & {
    remainingTimes: { [key: string]: { wateringTime: number, wateringIn: number, wateringVolume: number } };
  }

  type ConfigMessage = Message & {
    config: Config;
  }