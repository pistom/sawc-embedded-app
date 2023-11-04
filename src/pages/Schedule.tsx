import { useEffect, useState } from "react";
import { useFetch } from "use-http";

interface Event {
  id: string;
  module: string;
  output: string;
  type: string;
  startDate: string;
  endDate: string;
  watering: { time: string, volume: number }[];
}

export default function Schedule({ setTitle }: { setTitle: (title: string) => void }) {
  const [schedule, setSchedule] = useState<Event[]>([]);
  useEffect(() => { initializeSchedule()}, [])
  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const { get, post, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)

  async function initializeSchedule() {
    const initialSchedule = await get('/schedule')
    if (response.ok) setSchedule(initialSchedule.events.sort((a: Event, b: Event) => a.output.localeCompare(b.output)))
  }

  async function addEvent() {
    const newEvent = await post('/schedule', { device: 'MODULE_01', output: '1', type: 'period', startDate: '2021-01-01', endDate: '2021-01-01', watering: [{ time: '11:15', volume: 100 }, { time: '13:15', volume: 100 }] })
    if (response.ok) setSchedule([...schedule, newEvent])
  }

  return (<>
    <h1>Schedule</h1>

    {loading && 'Loading...'}
    {error && 'Error!'}
    {schedule && schedule.map((event: Event) => {console.dir(event); return (
      <div key={event.id}>
        <h2>module: {event.module} | output: {event.output}</h2>
        <p><b>{event.type}</b></p>
        {event.startDate && <p>start: {event.startDate}</p>}
        {event.endDate && <p>end: {event.endDate}</p>}
        {event.watering.map((watering) => {
          return (<p key={watering.time}>{watering.time} | {watering.volume}</p>)
        })}
      </div>
    )})}
  </>)
}