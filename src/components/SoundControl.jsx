import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ico } from './Icons.jsx';

export default function SoundControl({ sound }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const down = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const key = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('pointerdown', down);
      document.removeEventListener('keydown', key);
    };
  }, [open]);

  const pct = Math.round(sound.vol * 100);

  return (
    <div className="sound-wrap" ref={wrapRef}>
      <button type="button" className={`btn btn-icon btn-ghost${sound.on ? ' snd-on' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open} aria-haspopup="dialog"
        title="Musik kebun" aria-label="Pengaturan musik kebun">
        <Ico n={sound.on ? 'volume' : 'volumeX'} size={19} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="sound-pop" role="dialog" aria-label="Pengaturan suara kebun"
            initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
            <div className="snd-head">
              <span className="snd-ic"><Ico n="volume" size={16} /></span>
              <div>
                <p className="snd-title">Musik Kebun</p>
                <p className="snd-sub">musik instrumental · siang &amp; senja</p>
              </div>
            </div>
            <button type="button" className={`snd-row${sound.on ? ' on' : ''}`}
              role="switch" aria-checked={sound.on} onClick={sound.toggle}>
              <span className="snd-label">Musik kebun</span>
              <span className="snd-toggle"><span className="knob" /></span>
            </button>
            <div className={`snd-vol${sound.on ? '' : ' off'}`}>
              <input type="range" min="0" max="100" step="1" value={pct}
                style={{ '--fill': pct + '%' }}
                onChange={(e) => sound.setVol(e.target.value / 100)}
                aria-label="Volume suara kebun" />
              <span className="snd-val">{pct}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}