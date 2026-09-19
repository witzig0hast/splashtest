import { useEffect, useRef, useState } from 'react';

export default function TimerBar({ timeLeftMs, totalMs }: { timeLeftMs: number; totalMs: number }) {
  const [display, setDisplay] = useState(timeLeftMs);
  const baseRef = useRef({ value: timeLeftMs, at: Date.now() });

  useEffect(() => {
    baseRef.current = { value: timeLeftMs, at: Date.now() };
    setDisplay(timeLeftMs);
  }, [timeLeftMs]);

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Date.now() - baseRef.current.at;
      setDisplay(Math.max(0, baseRef.current.value - elapsed));
    }, 100);
    return () => clearInterval(id);
  }, []);

  const pct = totalMs > 0 ? Math.max(0, Math.min(100, (display / totalMs) * 100)) : 0;
  return (
    <div className="timer-bar">
      <div className="timer-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
