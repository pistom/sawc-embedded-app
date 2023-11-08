import { useEffect, useState } from "react";
import { useFetch } from "use-http";
import ScheduleEvent from "../components/ScheduleEvent";
import "./schedule.css";
import EditScheduleEvent from "../components/EditScheduleEvent";
import { validateScheduleEvent } from "../helpers/validateScheduleEvents";

interface ScheduleProps {
  setTitle: (title: string) => void,
  config: Config | null,
  devices: DeviceConfig[],
}

export default function Schedule({ setTitle, config, devices }: ScheduleProps) {
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  useEffect(() => { initializeSchedule() }, [])
  useEffect(() => {
    setTitle('Schedule');
  }, [setTitle]);

  const { get, post, del, put, response, loading, error } = useFetch()
  const [errors, setErrors] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editedEvent, setEditedEvent] = useState<ScheduleEvent | null>(null);

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

  if (!config) return (<div className="mx-4 sm:mx-0">Loading...</div>);

  return (<div className="mx-4 sm:mx-0">
    {loading && 'Loading...'}
    {error && 'Error!'}
    {schedule && schedule.map((event: ScheduleEvent) => (
      <ScheduleEvent key={event.id} event={event} setSchedule={setSchedule} schedule={schedule} config={config} setIsAdding={setIsAdding} setEditedEvent={setEditedEvent} deleteEvent={handleDelete} />
    ))}
    <p className="text-right">
      <button className="btn btn-primary" onClick={() => setIsAdding(true)}>Add new planing</button>
    </p>
    {isAdding &&
      <EditScheduleEvent editedEvent={editedEvent} setEditedEvent={setEditedEvent} errors={errors} setErrors={setErrors} addEvent={addEvent} setIsAdding={setIsAdding} config={config} devices={devices} />
    }
  </div>)
}