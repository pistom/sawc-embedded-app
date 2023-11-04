type WeekDays = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

type ScheduleEvent = {
  id: number;
  device: string;
  output: string;
  type: string;
  startDate: string;
  endDate: string;
  watering: { time: string, volume: number }[];
  days: WeekDays[];
}