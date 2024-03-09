import { useContext, useEffect, useState } from "react";
import { useFetch } from "use-http";
import ScheduleEvent from "../components/ScheduleEvent";
import "./schedule.css";
import EditScheduleEvent from "../components/EditScheduleEvent";
import { validateScheduleEvent } from "../helpers/validateScheduleEvents";
import socket from "../socket";
import { createPortal } from "react-dom";
import { CheckCircleIcon, ExclamationTriangleIcon, EyeIcon } from "@heroicons/react/24/outline";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppParamsContext } from "../context/AppParamsContext";

interface ScheduleProps {
  config: Config | null,
  devices: DeviceConfig[],
}

export default function Schedule({ config, devices }: ScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [isInitialized, setIsInitialized] = useState<Date | boolean | null>(null);
  const { get, post, del, put, response, loading, error, cache } = useFetch()
  const [errors, setErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editedEvent, setEditedEvent] = useState<ScheduleEvent | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => { initializeSchedule() }, [])

  const appParams = useContext(AppParamsContext);
  useEffect(() => {
    appParams.setPageTitle('Schedule');
  }, [appParams]);

  useEffect(() => {
    socket && socket.on("message", (message) => {
      if(message.action === 'heartbeat' && message.process === 'worker') {
        setIsInitialized(new Date());
      }
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if(isInitialized || isInitialized === null) {
        setIsInitialized(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isInitialized]);

  const dateTimeToObjectsAll = (schedule: ScheduleEventRaw[]): ScheduleEvent[] => {
    const events = schedule.map((event: ScheduleEventRaw): ScheduleEvent => {
      return dateTimeStringToObjects(event);
    })
    return events;
  }

  const dateTimeStringToObjects = (event: ScheduleEventRaw): ScheduleEvent => {
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
  }

  async function initializeSchedule() {
    cache.clear();
    const initialSchedule = await get('/schedule');
    let initialScheduleEvents = [] as ScheduleEvent[];
    initialSchedule && initialSchedule.events && (initialScheduleEvents = dateTimeToObjectsAll(initialSchedule.events));
    if (response.ok) setSchedule(initialScheduleEvents.sort((a: ScheduleEvent, b: ScheduleEvent) => a.output.localeCompare(b.output)))
  }

  const validateEvent = (event: ScheduleEvent): string[] => {
    return validateScheduleEvent(event)
  }

  async function addEvent(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, newEvent: ScheduleEvent) {
    e.preventDefault();
    if (newEvent.watering.length > 1 && newEvent.watering[0].volume === 0) {
      newEvent.watering.shift();
    }
    const errors = validateEvent(newEvent);
    setErrors(errors);
    if (errors.length > 0) return;
    // New event
    if (newEvent.id === -1) {
      const event = await post('/schedule', newEvent);
      if (response.ok) {
        setSchedule([
          ...schedule,
          dateTimeStringToObjects(event)
        ]);
        setIsAdding(false);
      }
    }
    // Edit existing event 
    else {
      const event = await put('/schedule/', newEvent);
      if (response.ok) {
        const newSchedule = schedule.map((scheduleEvent: ScheduleEvent) => {
          if (scheduleEvent.id === event.id) {
            return dateTimeStringToObjects(event);
          }
          return scheduleEvent;
        });
        setSchedule(newSchedule);
        setIsAdding(false);
      }
    }
    setEditedEvent(null);
  }

  const handleDelete = async (event: ScheduleEvent) => {
    const deletedEvent = await del(`/schedule/${event.id}`);
    if (response.ok) {
      const newSchedule = schedule.filter((scheduleEvent: ScheduleEvent) => {
        return scheduleEvent.id !== Number(deletedEvent.id);
      });
      setSchedule(newSchedule);
    }
  }

  const handleRemoveFilters = () => {
    searchParams.delete('device');
    searchParams.delete('output');
    navigate(`/schedule?${searchParams.toString()}`); 
    // window.location.href = `/schedule?${searchParams.toString()}`;
  }

  if (!config) return (<div className="mx-4 sm:mx-0">Loading...</div>);
  return (<div className="mx-4 sm:mx-0">
    {isInitialized === null && <>
      {createPortal(<span className="inline"><EyeIcon className="h-7 w-7 text-blue-500 ml-2 inline" /><span className="text-sm align-middle ml-1 whitespace-nowrap">Waiting for schedule status</span></span> , document.getElementById('afterTitle') as HTMLElement)}
    </>}
    {isInitialized === false && <>
      {createPortal(<span className="inline"><ExclamationTriangleIcon className="h-7 w-7 text-red-500 ml-2 inline" /><span className="text-sm align-middle ml-1 whitespace-nowrap">The schedule is not running.</span></span> , document.getElementById('afterTitle') as HTMLElement)}
    </> }
    {isInitialized && <>
      {createPortal(<span className="inline"><CheckCircleIcon className="h-7 w-7 text-green-500 ml-2 inline" /><span className="text-sm align-middle ml-1 whitespace-nowrap">The schedule is running.</span></span> , document.getElementById('afterTitle') as HTMLElement)}
    </> }
    
    {loading && 'Loading...'}
    {error && 'Error!'}
    {searchParams.get('device') || searchParams.get('output') ?
      <h1 className="text-lg mb-4">
        Schedule for: 
        <span className="mx-2">{config.devices[searchParams.get('device') || '']?.name}</span>
        <span className="font-bold mr-4">{config.devices[searchParams.get('device') || '']?.outputs[searchParams.get('output') || '']?.name || `Output ${searchParams.get('output')}` }</span>
        <span><button onClick={handleRemoveFilters} className="btn btn-sm">Show events for all plants</button></span>
      </h1> : null
    }
    {schedule && schedule
      .filter((event: ScheduleEvent) => searchParams.get('device') ? event.device === searchParams.get('device') : true)
      .filter((event: ScheduleEvent) => searchParams.get('output') ? event.output === searchParams.get('output') : true)
      .map((event: ScheduleEvent) => (
      <ScheduleEvent key={event.id} event={event} setSchedule={setSchedule} schedule={schedule} config={config} setIsAdding={setIsAdding} setEditedEvent={setEditedEvent} deleteEvent={handleDelete} />
    ))}
    <p className="text-right">
      <button className="btn btn-primary" onClick={() => setIsAdding(true)}>Add new planing</button>
    </p>
    {isAdding &&
      <EditScheduleEvent editedEvent={editedEvent} setEditedEvent={setEditedEvent} errors={errors} setErrors={setErrors} addEvent={addEvent} setIsAdding={setIsAdding} config={config} devices={devices} selectedDevice={searchParams.get('device')} selectedOutput={searchParams.get('output')} />
    }
  </div>)
}