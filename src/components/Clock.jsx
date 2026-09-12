import { useState, useEffect } from 'react';
import { fmtTime } from '../lib/garden.js';

export default function Clock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const i = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(i);
  }, []);
  return <span className="clock">{fmtTime.format(t)}</span>;
}