import { useState, useEffect, useRef } from 'react';

type TimerProps = {
  duration: number;
  type: string;
  initial: number;
};

export default function Timer({ duration, type, initial }: TimerProps) {
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
  }, [duration]);

  useEffect(() => {
    if (timeLeft <= 0) {
      intervalIdRef.current && clearInterval(intervalIdRef.current);
      setTimeLeft(0);
    }
    if (type === 'current') {
      setWidth(`${(timeLeft/initial)* 100}%`);
    }
  }, [timeLeft, initial, type]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.ceil(time % 60);
    return <>
      {`${minutes > 0 ? `${minutes.toString()}:` : ''}${`${seconds.toString().padStart(2, '0')}`}`}
    </>
  };

  return (
    <div className="timer">
      <div className={`label ${type === 'scheduled' ? "text-xs":"text-base"}`}>{type === 'scheduled' && `Start in ` }{formatTime(timeLeft)}</div>
      <div className={`countdown ${type}`} style={{width}}></div>
    </div>
  );
}