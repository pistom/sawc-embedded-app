import { useState, useEffect, useRef } from 'react';
import './timer.css';

type TimerProps = {
  duration: number;
  type: string;
  initial?: number;
  finishCallback?: () => void;
  disableCounter?: boolean;
};

export default function Timer({ duration, type, initial = duration, finishCallback, disableCounter }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [width, setWidth] = useState('100%');
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalIdRef.current = setInterval(() => {
      setTimeLeft(prevTimeLeft => prevTimeLeft - 1);
    }, 1000);

    return () => {
      intervalIdRef.current && clearInterval(intervalIdRef.current);
    };
  }, [duration, initial]);

  useEffect(() => {
    if (timeLeft <= 0) {
      intervalIdRef.current && clearInterval(intervalIdRef.current);
      setTimeLeft(0);
      if (finishCallback) finishCallback();
    }
    if (type === 'current') {
      setWidth(`${(timeLeft/initial)* 100}%`);
    }
  }, [timeLeft, initial, type, duration, finishCallback]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.ceil(time % 60);
    return <>
      {`${minutes > 0 ? `${minutes.toString()}:` : ''}${`${seconds.toString().padStart(2, '0')}`}`}
    </>
  };

  return (
    <div className={`timer  ${type}`}>
      {!disableCounter && 
        <div className="label">
          {type === 'scheduled' && `Start in ` }{formatTime(timeLeft)}
        </div>}
      <div className={`countdown`} style={{width}}></div>
    </div>
  );
}