import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

interface EditScheduleEventProps {
  editedEvent?: ScheduleEvent,
  config: Config,
  devices: DeviceConfig[],
  addEvent: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, event: ScheduleEvent) => void,
  errors: string[],
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as WeekDays[];
const daysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function EditScheduleEvent({ addEvent, editedEvent, devices, errors }: EditScheduleEventProps) {

  const tommorow = new Date();
  tommorow.setDate(tommorow.getDate() + 1);

  const [event, setEvent] = useState<ScheduleEvent>({
    id: -1,
    device: devices[0].id,
    output: devices[0].outputs[0].id,
    startDate: new Date(),
    endDate: tommorow,
    type: 'period',
    watering: [],
    days: [],
  } as ScheduleEvent);

  const [watering, setWatering] = useState<Watering>({ time: new Date(), volume: 0 });
  const [repeatType, setRepeatType] = useState('weekdays');


  useEffect(() => {
    if (editedEvent) {
      setEvent(editedEvent);
    }
  }, [])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEvent = { ...event };
    newEvent.type = e.target.value as ScheduleEventType;
    setEvent(newEvent);
  }
  const handleOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newEvent = { ...event };
    newEvent.output = e.target.value;
    setEvent(newEvent);
  }

  const handleAddNewWatering = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (watering.volume <= 0) return;
    const newEvent = { ...event };
    newEvent.watering.push(watering);
    setEvent(newEvent);
  }

  const handleNewWateringVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWatering = { ...watering } as Watering;
    newWatering.volume = Number(e.target.value);
    setWatering(newWatering);
  }

  const handleNewWateringTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWatering = { ...watering } as Watering;
    const [hours, minutes] = e.target.value.split(':');
    newWatering.time = new Date(0, 0, 0, Number(hours), Number(minutes));
    setWatering(newWatering);
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEvent = { ...event };
    newEvent.startDate = new Date(e.target.value);
    setEvent(newEvent);
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEvent = { ...event };
    newEvent.endDate = new Date(e.target.value);
    setEvent(newEvent);
  }

  const handleRemoveWatering = (index: number) => {
    const newEvent = { ...event };
    newEvent.watering.splice(index, 1);
    setEvent(newEvent);
  }

  const handleToggleDay = (day: WeekDays) => {
    const newEvent = { ...event };
    if (newEvent.days?.includes(day)) {
      newEvent.days = newEvent.days.filter((d: WeekDays) => d !== day);
    } else {
      newEvent.days = [...newEvent.days || [], day];
    }
    setEvent(newEvent);
  }
  
  const handleRepeatTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEvent = { ...event };
    delete newEvent.repeatEvery;
    delete newEvent.days;
    setRepeatType(e.target.value);
    setEvent(newEvent);
  };

  const handleRepeatEveryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEvent = { ...event };
    newEvent.repeatEvery = Number(e.target.value);
    setEvent(newEvent);
  }

  return (<div className="card bg-blue-50 edit-schedule-event relative">
    {errors.length > 0 && <div className="errors absolute top-0 left-0 right-0 bg-red-100 text-red-500 text-xs p-2">
      {errors.map((error: string, index: number) => <p key={index}>{error}</p>)}
    </div>}
    <form className="form flex flex-col lg:flex-row">
      <div className="field-container">
        <label htmlFor="type">Schedule type</label>
        <select name="type" id="type" className="form-select w-full" value={event.type} onChange={handleTypeChange}>
          <option value="always">Always</option>
          <option value="period">Period</option>
          <option value="once">Once</option>
        </select>
      </div>
      <div className="field-container">
        <label htmlFor="device">Device</label>
        <select name="device" id="device" className="form-select w-full" value={event.device} onChange={handleTypeChange}>
          {devices.map((device: DeviceConfig, index: number) => (
            <option key={index} value={device.id}>{device.name}</option>
          ))}
        </select>
      </div>
      <div className="field-container">
        <label htmlFor="output">Output</label>
        <select name="output" id="output" className="form-select w-full" value={event.output} onChange={handleOutputChange}>
          {devices.find((device: DeviceConfig) => device.id === event.device)?.outputs.map((output: OutputConfig, index: number) => (
            <option key={index} value={output.id}>{output.name || `Output ${output.id}`}</option>
          ))}
        </select>
      </div>
      <div className="field-container">
        <label htmlFor="watering">Watering</label>
        <div className="watering gap-2">
          {event.watering.map((watering, i) => {
            return (<div key={i} className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1">{watering.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="ml-2 volume badge">{watering.volume} ml</span>
              <span onClick={() => handleRemoveWatering(i)} ><XMarkIcon className="h-4 w-4" /></span>
            </div>)
          })}
          <div className="flex gap-2">
            <div className="time">
              <input type="time" name="time" id="time" className="form-input w-16" value={watering.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} onChange={handleNewWateringTimeChange} />
            </div>
            <div className="volume flex">
              <input type="number" name="volume" id="volume" value={watering.volume} onChange={handleNewWateringVolumeChange} className="form-input unit unit-sm" />
              <span className="unit-label unit-label-sm flex-initial">ml</span>
            </div>
            <div className="actions">
              <button className="btn btn-secondary" onClick={handleAddNewWatering}>Add</button>
            </div>
          </div>
        </div>
      </div>
      {event.type === 'period' && <div className="field-container flex gap-1 lg:block items-start">
        <div className="flex-1">
          <label htmlFor="startDate">Start date</label>
          <input type="date" name="startDate" id="startDate" className="form-input w-full" value={event.startDate.toISOString().split('T')[0]} onChange={handleStartDateChange} />
        </div>
        <div className="flex-1">
          <label htmlFor="endDate">End date</label>
          <input type="date" name="endDate" id="endDate" className="form-input w-full" value={event.endDate?.toISOString().split('T')[0] || (new Date).toISOString().split('T')[0] } onChange={handleEndDateChange} />
        </div>
      </div>}
      {event.type === 'once' && <div className="field-container">
        <label htmlFor="startDate">Date</label>
        <input type="date" name="startDate" id="startDate" className="form-input" value={event.startDate.toISOString().split('T')[0]} onChange={handleStartDateChange} />
      </div>}
      {event.type !== 'once' && <div className="lg:mr-2 lg:pr-2 mb-4">
        <div className="labels flex text-xs">
          <label htmlFor="weekdays">
            <input id="weekdays" className="mr-1" type="radio" name="repeat-type" value="weekdays" checked={repeatType === 'weekdays'} onChange={handleRepeatTypeChange} />
            Weekdays
          </label>
          <label htmlFor="repeatevery">
            <input id="repeatevery" className="ml-2 mr-1" type="radio" name="repeat-type" value="repeatevery" checked={repeatType === 'repeatevery'} onChange={handleRepeatTypeChange} />
            Repeat
          </label>
        </div>
        <div className="days flex-none">
          {repeatType === 'weekdays' && days.map((day: WeekDays) =>
            <span className={`badge badge-lg mr-1 mb-1 cursor-pointer ${event.days?.includes(day) ? 'badge-primary' : ''}`}
              key={day}
              onClick={() => handleToggleDay(day)}>
              {daysShort[days.indexOf(day)]}</span>
          )}
          {repeatType === 'repeatevery' && <div className="flex items-center gap-2">
            <span className="text-sm">Every</span>
            <input type="number" name="repeatEvery" id="repeatEvery" className="form-input w-16" onChange={handleRepeatEveryChange} value={event.repeatEvery || 0} />
            <span className="text-sm">days</span>
          </div>}
        </div>
      </div>}
      <div className="flex-1 form-actions text-right self-end">
        <button className="btn btn-primary lg:mb-4" onClick={(e) => addEvent(e, event)}>Save</button>
      </div>
      <button className="absolute top-2 right-2"><XMarkIcon className="h-5 w-5 text-gray-500 hover:text-red-500" /></button>
    </form>

  </div>)
}