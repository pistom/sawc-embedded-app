import { useState, useEffect, useRef } from 'react';

type TimerProps = {
  duration: number;
  label: string;
};

export default function Timer({ duration, label }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

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
  }, [timeLeft]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.ceil(time % 60);
    return <>
      {minutes > 0 || seconds > 0 ? label + ' ' : ''}
      {`${minutes > 0 ? `${minutes.toString()}:` : ''}${seconds > 0 ? `${seconds.toString().padStart(2, '0')}sec` : ''}`}
    </>
  };

  return (
    <span>
      {formatTime(timeLeft)}
    </span>
  );
}