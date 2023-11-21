import { ArrowPathIcon, ArrowSmallDownIcon, ArrowsRightLeftIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ScheduleEventProps {
  event: ScheduleEvent,
  setSchedule: (schedule: ScheduleEvent[]) => void,
  schedule: ScheduleEvent[],
  config: Config,
  setIsAdding: (isAdding: boolean) => void,
  setEditedEvent: (event: ScheduleEvent) => void,
  deleteEvent: (event: ScheduleEvent) => void,
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as WeekDays[];
const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleEvent({ event, config, setIsAdding, setEditedEvent, deleteEvent }: ScheduleEventProps) {

  const deviceName = config.devices[event.device].name || event.device;
  const outputName = config.devices[event.device].outputs[event.output].name || event.output;

  const eventHasAllDays = (days: string[]) => {
    return new Set([...days]).size === 7;
  }

  const handleEditClick = () => {
    setIsAdding(true);
    setEditedEvent(event);
  }

  const handleDeleteClick = () => {
    if (confirm(`Are you sure you want to delete this event?`)) {
      deleteEvent(event);
    }
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
              {event.startDate && <div><p className="text-xs text-gray-500">{event.type === 'once' ? 'date' : 'from'}</p><p className="mr-4">{event.startDate.toLocaleDateString()}</p></div>}
              {event.endDate && <div><p className="text-xs text-gray-500">to</p><p>{event.endDate.toLocaleDateString()}</p></div>}
            </div>
          }
        </div>
        {event.days &&
          <div className="days flex-none w-16 md:text-right sm:w-32 md:w-64 lg:w-72">
              <p className="text-xs text-gray-500">weekdays</p>
              {eventHasAllDays(event.days) ? 
                <span className="badge badge-primary mb-1">All days</span> :
               event.days.map((day: WeekDays) =>
                <span className="badge badge-primary mr-1 mb-1" key={day}>{daysShort[days.indexOf(day)]}</span>
              )}
          </div>
        }
        {!event.days && event.repeatEvery &&
          <div className="days flex-none w-auto md:text-right sm:w-32 md:w-64 lg:w-72">
              <p className="text-xs text-gray-500">repeat</p>
              <span className="badge badge-secondary mb-1">Every {event.repeatEvery} days</span>
          </div>
        }
        {event.type === 'once' && <div className="days flex-none w-16 md:text-right sm:w-32 md:w-64 lg:w-72">
          <p className="text-xs text-gray-500">repeat</p>
          <span className="badge badge-ternary mb-1">Once</span>
        </div>}
        <div className="actions w-16 text-right">
          <button className="sm:mx-1" onClick={handleEditClick}><PencilSquareIcon className="h-5 w-5 text-gray-400 hover:text-blue-500" /></button>
          <button onClick={handleDeleteClick}><TrashIcon className="h-5 w-5 text-gray-400 hover:text-red-500" /></button>
        </div>
      </div>
    </div>
  </>)
}