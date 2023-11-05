import { useEffect, useState } from "react";
import { useFetch } from "use-http";
import ScheduleEvent from "../components/ScheduleEvent";
import "./schedule.css";

export default function Schedule({ setTitle, config }: { setTitle: (title: string) => void, config: Config | null }) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  useEffect(() => { initializeSchedule() }, [])
  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const { get, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)

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

  async function addEvent(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    // const newEvent = { id: 4, device: 'MODULE_01', output: '1', type: 'period', startDate: '2021-01-01', endDate: '2021-01-01', watering: [{ time: '11:15', volume: 100 }, { time: '13:15', volume: 100 }] } as ScheduleEvent;
    // setSchedule([...schedule, newEvent])
    console.dir(schedule)
    // const newEvent = await post('/schedule', )
    // if (response.ok) setSchedule([...schedule, newEvent])
  }

  return (<div className="mx-4 sm:mx-0">
    {loading && 'Loading...'}
    {error && 'Error!'}
    {config && schedule && schedule.map((event: ScheduleEvent) => (
      <ScheduleEvent key={event.id} event={event} setSchedule={setSchedule} schedule={schedule} config={config} />
    ))}
    <button onClick={addEvent}>Add</button>
  </div>)
}