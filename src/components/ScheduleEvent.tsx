import { ArrowPathIcon, ArrowSmallDownIcon, ArrowsRightLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
// import { useFetch } from "use-http";
// import Toggle from "./form/Toggle";

interface ScheduleEventProps {
  event: ScheduleEvent,
  setSchedule: (schedule: ScheduleEvent[]) => void,
  schedule: ScheduleEvent[],
  config: Config
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as WeekDays[];
const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleEvent({ event, config }: ScheduleEventProps) {

  const deviceName = config.devices[event.device].name || event.device;
  const outputName = config.devices[event.device].outputs[event.output].name || event.output;
  // const selectedDays = event.days || [] as WeekDays[];

  // const { get, post, response, loading, error } = useFetch(`http://${window.location.hostname}:3001`)

  async function deleteEvent() {
    console.dir(event);
    // const deletedEvent = await post('/schedule/delete', { id: event.id })
    // if (response.ok) setSchedule(schedule.filter((e: ScheduleEvent) => e.id !== event.id))
  }

  const eventHasAllDays = (days: string[]) => {
    return new Set([...days]).size === 7;
  }
  // const handleToggleDay = (day: WeekDays) => {
  //   if (selectedDays.includes(day)) {
  //     const newDays = selectedDays.filter((d: WeekDays) => d !== day);
  //     setSchedule(schedule.map((e: ScheduleEvent) => {
  //       if (e.id === event.id) e.days = newDays;
  //       return e;
  //     }))
  //   } else {
  //     const newDays = [...selectedDays, day];
  //     setSchedule(schedule.map((e: ScheduleEvent) => {
  //       if (e.id === event.id) e.days = newDays;
  //       return e;
  //     }))
  //   }
  // }

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
            <p className="text-xs text-gray-500">time/volume</p>
            {event.watering.map((watering, i) => {
              return (<div key={i} className="flex items-center gap-2">
                <span>{watering.time.toLocaleTimeString([],{ hour: '2-digit', minute: '2-digit' } )}</span>
                <span className="volume badge">{watering.volume} ml</span>
              </div>)
            })}
          </div>
          {event.startDate &&
            <div className="date lg:flex">
            {event.startDate && <div><p className="text-xs text-gray-500">{event.endDate ? 'from' : 'date'}</p><p className="mr-4">{event.startDate.toLocaleDateString()}</p></div>}
            {event.endDate && <div><p className="text-xs text-gray-500">to</p><p>{event.endDate.toLocaleDateString()}</p></div>}
              {/* {days.map((day: WeekDays) =>
                <Toggle 
                  className="mr-0 pr-1 mb-2" 
                  key={day} label={daysShort[days.indexOf(day)]} 
                  checked={event.days.includes(day)} 
                  onChange={() => handleToggleDay(day)} />
              )} */}
            </div>
          }
        </div>
        {event.days &&
          <div className="days flex-none w-16 md:text-right sm:w-32 md:w-64 lg:w-72">
              <p className="text-xs text-gray-500">week days</p>
              {eventHasAllDays(event.days) ? 
                <span className="badge badge-secondary mb-1">All</span> :
               event.days.map((day: WeekDays) =>
                <span className="badge badge-primary mr-1 mb-1" key={day}>{daysShort[days.indexOf(day)]}</span>
              )}
          </div>
        }
        <div className="actions w-16 text-right">
          <button className="sm:mx-1" onClick={deleteEvent}><PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-blue-500" /></button>
          <button onClick={deleteEvent}><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
        </div>
      </div>
    </div>
  </>)
}