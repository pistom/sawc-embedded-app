import { useEffect, useState } from "react";
import { useFetch } from "use-http";
import ScheduleEvent from "../components/ScheduleEvent";
import "./schedule.css";

export default function Schedule({ setTitle, config }: { setTitle: (title: string) => void, config: Config | null}) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  useEffect(() => { initializeSchedule()}, [])
  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const { get, post, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)

  async function initializeSchedule() {
    const initialSchedule = await get('/schedule')
    if (response.ok) setSchedule(initialSchedule.events.sort((a: ScheduleEvent, b: ScheduleEvent) => a.output.localeCompare(b.output)))
  }

  async function addEvent(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    const newEvent = { id: 4, device: 'MODULE_01', output: '1', type: 'period', startDate: '2021-01-01', endDate: '2021-01-01', watering: [{ time: '11:15', volume: 100 }, { time: '13:15', volume: 100 }] } as ScheduleEvent;
    setSchedule([...schedule, newEvent])
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