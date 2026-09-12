import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* Kehidupan ambient scene — semua pointer-events:none & murni transform
   (murah untuk CPU/baterai mobile):
   - siang: kupu-kupu melintas + kawanan burung sesekali
   - senja: kunang-kunang
   - kucing kampung mampir sesekali, duduk ~40 detik, lalu pergi */

const Cat = () => (
  <svg viewBox="0 0 100 84" width="76">
    <path className="cat-tail" d="M65 72C80 74 92 60 86 48" stroke="#2F3B2E" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M32 76C30 52 38 40 50 40C62 40 70 52 68 76Z" fill="#2F3B2E" />
    <circle cx="50" cy="34" r="13" fill="#2F3B2E" />
    <path d="M39 30L37 13L46 23Z" fill="#2F3B2E" />
    <path d="M61 30L63 13L54 23Z" fill="#2F3B2E" />
    <circle cx="45.5" cy="33" r="1.7" fill="#F7F2E9" /><circle cx="54.5" cy="33" r="1.7" fill="#F7F2E9" />
    <path d="M48 38q2 2 4 0" stroke="#F7F2E9" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

const Bird = ({ s, ml }) => (
  <svg viewBox="0 0 24 10" width={Math.round(26 * s)} style={{ marginLeft: ml }}>
    <path d="M2 8Q7 2 12 6Q17 2 22 8" stroke="#2F3B2E" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity=".6" />
  </svg>
);

export default function AmbientLife({ dusk }) {
  const [flock, setFlock] = useState(false);
  const [cat, setCat] = useState(null);

  useEffect(() => {
    let alive = true;
    const ts = [];
    const loop = (fn, min, max) => {
      ts.push(setTimeout(() => {
        if (!alive) return;
        fn();
        loop(fn, min, max);
      }, min + Math.random() * (max - min)));
    };
    loop(() => { setFlock(true); ts.push(setTimeout(() => setFlock(false), 9500)); }, 24000, 70000);
    loop(() => {
      setCat({ left: 5 + Math.random() * 72 });
      ts.push(setTimeout(() => setCat(null), 42000));
    }, 55000, 110000);
    return () => { alive = false; ts.forEach(clearTimeout); };
  }, []);

  return (
    <>
      {dusk ? (
        <div className="fireflies" aria-hidden="true">
          {[[10, 76], [26, 88], [50, 82], [70, 90], [86, 84], [38, 94]].map(([l, b], i) => (
            <span key={i} className="firefly" style={{ left: l + '%', bottom: b + '%', animationDelay: `${i * 1.9}s, ${i * 0.8}s` }} />
          ))}
        </div>
      ) : (
        <div className="butterfly" aria-hidden="true">
          <svg viewBox="0 0 60 44" width="34">
            <path d="M29 22C20 4 4 2 3 12c1 9 12 12 26 10z" fill="#C97B6B" />
            <path d="M31 22C40 4 56 2 57 12c-1 9-12 12-26 10z" fill="#D4A24C" />
            <ellipse cx="30" cy="22" rx="2.4" ry="9" fill="#2F3B2E" />
          </svg>
        </div>
      )}
      <AnimatePresence>
        {flock && !dusk && (
          <motion.div className="birdflock" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
            <Bird s={1} ml={0} /><Bird s={0.8} ml={18} /><Bird s={0.9} ml={34} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cat && (
          <motion.div className="visitor-cat" style={{ left: cat.left + '%' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }} aria-hidden="true">
            <Cat />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}