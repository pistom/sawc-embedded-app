import { useEffect } from "react";

export default function Schedule({setTitle}: {setTitle: (title: string) => void}) {
  useEffect(() => {
    setTitle('Schedule');
  },[setTitle]);
  return (
      <h1>Schedule</h1>
  )
}