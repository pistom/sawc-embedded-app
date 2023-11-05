type WeekDays = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type ScheduleEventRaw = {
  id: number;
  device: string;
  output: string;
  type: string;
  startDate: string;
  endDate: string;
  watering: { time: string, volume: number }[];
  days: WeekDays[];
}

type ScheduleEvent = {
  id: number;
  device: string;
  output: string;
  type: string;
  days: WeekDays[];
  startDate: Date;
  endDate: Date;
  watering: Watering[];
}

type Watering = {
  time: Date;
  volume: number;
}