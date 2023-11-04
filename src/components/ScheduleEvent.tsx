import { ArrowPathIcon, ArrowSmallDownIcon, ArrowsRightLeftIcon, PencilIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useFetch } from "use-http";
import Toggle from "./form/Toggle";

interface ScheduleEventProps {
  event: ScheduleEvent,
  setSchedule: (schedule: ScheduleEvent[]) => void,
  schedule: ScheduleEvent[],
  config: Config
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as WeekDays[];
const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleEvent({ event, setSchedule, schedule, config }: ScheduleEventProps) {

  const deviceName = config.devices[event.device].name || event.device;
  const outputName = config.devices[event.device].outputs[event.output].name || event.output;

  const { get, post, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)

  async function deleteEvent() {
    const deletedEvent = await post('/schedule/delete', { id: event.id })
    if (response.ok) setSchedule(schedule.filter((e: ScheduleEvent) => e.id !== event.id))
  }

  return (<>
    <div className="event card">
      <p className="title">{outputName} <span>{deviceName}</span></p>
      <div className="details">
        <div className="type border-r flex-none w-20">
          {event.type === 'always' && <ArrowPathIcon className="icon" />}
          {event.type === 'period' && <ArrowsRightLeftIcon className="icon" />}
          {event.type === 'once' && <ArrowSmallDownIcon className="icon" />}
          <br />
          {event.type}
        </div>
        <div className="watering">
          <div className="time">
            <span className="text-xs text-gray-500">time/volume</span>
            {event.watering.map((watering, i) => {
              return (<div key={i} className="flex items-center gap-2"><span>{watering.time}</span><span className="volume">{watering.volume} ml</span> </div>)
            })}
          </div>
          {event.days &&
            <div className="days">
              {days.map((day: WeekDays) => 
                <Toggle style={{marginRight: 4, paddingRight: 4, marginBottom: 8}} key={day} label={daysShort[days.indexOf(day)]} checked={event.days.includes(day)} onChange={() => { }} />
              )}
            </div>
          }
        </div>
        {event.startDate &&
          <div className="date flex-none w-24 lg:w-56 lg:flex">
            {event.startDate && <p className="mr-4"><span>{event.endDate ? 'from' : 'date'}</span><br />{event.startDate}</p>}
            {event.endDate && <p><span>to</span><br />{event.endDate}</p>}
          </div>
        }
        <div className="actions w-16 text-right">
          <button className="mr-1" onClick={deleteEvent}><PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-blue-500" /></button>
          <button onClick={deleteEvent}><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
        </div>
      </div>
    </div>
  </>)
}