import { useEffect, useState } from "react";
import { useFetch } from "use-http";
import ScheduleEvent from "../components/ScheduleEvent";
import "./schedule.css";
import EditScheduleEvent from "../components/EditScheduleEvent";

interface ScheduleProps {
  setTitle: (title: string) => void,
  config: Config,
  devices: DeviceConfig[],
}

export default function Schedule({ setTitle, config, devices }: ScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  useEffect(() => { initializeSchedule() }, [])
  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const { get, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)
  const [errors, setErrors] = useState<string[]>([]);

  const dateTimeToObjects = (schedule: ScheduleEventRaw[]): ScheduleEvent[] => {
    const events = schedule.map((event: ScheduleEventRaw): ScheduleEvent => {
      const newEvent = { ...event } as unknown as ScheduleEvent;
      if (event.startDate) newEvent.startDate = new Date(event.startDate);
      if (event.endDate) newEvent.endDate = new Date(event.endDate);
      if (event.watering) newEvent.watering = event.watering.map((watering: { time: string, volume: number }): Watering => {
        const newWatering = { ...watering } as unknown as Watering;
        const [hours, minutes] = watering.time.split(':');
        newWatering.time = new Date(0, 0, 0, Number(hours), Number(minutes));
        return newWatering;
      })
      return newEvent;
    })
    return events;
  }
  async function initializeSchedule() {
    const initialSchedule = await get('/schedule');
    let initialScheduleEvents = [] as ScheduleEvent[];
    initialSchedule && (initialScheduleEvents = dateTimeToObjects(initialSchedule.events));
    if (response.ok) setSchedule(initialScheduleEvents.sort((a: ScheduleEvent, b: ScheduleEvent) => a.output.localeCompare(b.output)))
  }

  const validateEvent = (event: ScheduleEvent): void => {
    const errors = [] as string[];
    if (!event.device) errors.push('Device is required');
    if (!event.output) errors.push('Output is required');
    if (!event.type) errors.push('Type is required');
    if (event.watering.length === 0) errors.push('You must add at least one watering');
    if (event.watering.some((watering: Watering) => watering.volume <= 0)) errors.push('Watering volume must be greater than 0');
    if (event.watering.some((watering: Watering) => watering.time.getHours() === 0 && watering.time.getMinutes() === 0)) errors.push('Watering time is required');
    if ((event.type === 'period' || event.type === 'always') && event.repeatEvery && event.repeatEvery < 1) errors.push('Repeat every must be greater than 0');
    if ((event.type === 'period' || event.type === 'always') && event.repeatEvery && event.repeatEvery > 365) errors.push('Repeat every must be less than 365');
    if ((event.type === 'period' || event.type === 'always') && !event.days && !event.repeatEvery) errors.push('Days or repeat every is required');
    if ((event.type === 'period' || event.type === 'always') && event.days && event.days.length === 0) errors.push('You must select at least one day');
    if ((event.type === 'period' || event.type === 'once') && !event.startDate) errors.push('Start date is required');
    if (event.type === 'period' && !event.endDate) errors.push('End date is required');
    if (event.type === 'period' && event.startDate && event.endDate && event.startDate > event.endDate) errors.push('Start date must be before end date');
    if (event.type === 'period' && event.startDate && event.endDate && event.startDate.toLocaleDateString() === event.endDate.toLocaleDateString()) errors.push('Start date and end date must be different');
    setErrors(() => errors);
  }

  async function addEvent(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newEvent: ScheduleEvent) {
    e.preventDefault();
    validateEvent(newEvent);
    if(errors.length > 0) return;
    console.dir(newEvent);
    // const newEvent = { id: 4, device: 'MODULE_01', output: '1', type: 'period', startDate: '2021-01-01', endDate: '2021-01-01', watering: [{ time: '11:15', volume: 100 }, { time: '13:15', volume: 100 }] } as ScheduleEvent;
    // setSchedule([...schedule, newEvent])
    console.dir(schedule)
    // const newEvent = await post('/schedule', )
    // if (response.ok) setSchedule([...schedule, newEvent])
  }

  if (!config) return (<div className="mx-4 sm:mx-0">Loading...</div>);

  return (<div className="mx-4 sm:mx-0">
    {loading && 'Loading...'}
    {error && 'Error!'}
    {schedule && schedule.map((event: ScheduleEvent) => (
      <ScheduleEvent key={event.id} event={event} setSchedule={setSchedule} schedule={schedule} config={config} />
    ))}
    <EditScheduleEvent errors={errors} addEvent={addEvent} config={config} devices={devices} />
  </div>)
}