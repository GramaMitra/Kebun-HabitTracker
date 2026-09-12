import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ASSET } from '../assets/index.js';
import { stageOf, wiltLevelOf } from '../lib/garden.js';

function WaterFX({ h }) {
  const from = -Math.round(h * 0.7);
  const to = Math.round(h * 0.52);
  return (
    <>
      {[38, 46, 54, 62].map((x, i) => (
        <motion.span className="drop" key={i} style={{ left: x + '%' }}
          initial={{ y: from, opacity: 0 }}
          animate={{ y: [from, Math.round(to * 0.45), to], opacity: [0, 1, 1, 0], scaleY: [1, 1.2, 0.65] }}
          transition={{ duration: 0.6, delay: 0.12 + i * 0.09, ease: 'easeIn' }}>
          <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 3.2C12 3.2 6.2 10.4 6.2 14.6a5.8 5.8 0 0 0 11.6 0C17.8 10.4 12 3.2 12 3.2Z" fill="#8FAFB9" /></svg>
        </motion.span>
      ))}
      <motion.span className="ripple"
        initial={{ opacity: 0.55, scale: 0.35 }} animate={{ opacity: 0, scale: 1.45 }}
        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }} />
    </>
  );
}

export default function PlantVisual({ habit, today, fx = 0, w = 340, swayDelay = 0 }) {
  const stage = stageOf(habit);
  const wilt = wiltLevelOf(habit, today);
  const prevWilt = useRef(wilt);
  const [glow, setGlow] = useState(false);
  const [wig, setWig] = useState(false);
  const h = Math.round(w * 9 / 16);

  useEffect(() => {
    const was = prevWilt.current; prevWilt.current = wilt;
    if (was > 0 && wilt === 0) { setGlow(true); const t = setTimeout(() => setGlow(false), 900); return () => clearTimeout(t); }
  }, [wilt]);

  useEffect(() => {
    if (fx > 0) { setWig(true); const t = setTimeout(() => setWig(false), 750); return () => clearTimeout(t); }
  }, [fx]);

  return (
    <div className="plant-visual">
      {glow && (
        <motion.div className="recover-glow" initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: [0, 0.65, 0], scale: [0.7, 1.28, 1.12] }} transition={{ duration: 0.7 }} />
      )}
      <motion.div animate={{ rotate: wilt * 3.5, scaleY: 1 - wilt * 0.05, y: wilt * 3 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}>
        <div className={wilt > 0 ? 'wilt-sway' : 'sway'} style={{ animationDelay: -swayDelay + 's' }}>
          <motion.div animate={wig ? { rotate: [0, -5, 4, -2, 0] } : { rotate: 0 }} transition={{ duration: 0.7 }}>
            <div className="pv-stack" style={{ width: w, aspectRatio: '16 / 9' }}>
              <AnimatePresence>
                <motion.img key={stage} src={ASSET.plant[habit.species][stage]} alt="" loading="lazy" decoding="async"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.3, delay: 0.18, scale: { type: 'spring', stiffness: 260, damping: 18 } }} />
              </AnimatePresence>
              <motion.img src={ASSET.plant[habit.species].wilted} alt="" aria-hidden="true"
                initial={false} animate={{ opacity: wilt }} transition={{ duration: 0.8 }} />
            </div>
          </motion.div>
        </div>
      </motion.div>
      {fx > 0 && <WaterFX key={'fx' + fx} h={h} />}
    </div>
  );
}