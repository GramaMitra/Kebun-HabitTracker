import { useState, useEffect } from 'react';

/* Breakpoint responsif untuk logika JS (bukan cuma CSS) —
   ukuran kartu & gambar tanaman menyesuaikan mobile secara nyata. */
export function useIsMobile(px = 640) {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia(`(max-width:${px}px)`).matches);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${px}px)`);
    const f = (e) => setM(e.matches);
    mq.addEventListener('change', f);
    return () => mq.removeEventListener('change', f);
  }, [px]);
  return m;
}