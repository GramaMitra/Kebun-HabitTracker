import { motion } from 'framer-motion';

export const DECOR_MILESTONES = [
  { days: 5, label: 'kerikil' },
  { days: 15, label: 'jamur kecil' },
  { days: 30, label: 'lampu taman' },
  { days: 60, label: 'rumah burung' },
];

const Pebbles = () => (
  <svg viewBox="0 0 90 34" width="78">
    <ellipse cx="18" cy="26" rx="16" ry="8" fill="#CBBFA6" />
    <ellipse cx="48" cy="28" rx="12" ry="6.5" fill="#BCB09A" />
    <ellipse cx="72" cy="27" rx="10" ry="5.5" fill="#D8CDB8" />
  </svg>);

const Mushrooms = () => (
  <svg viewBox="0 0 80 62" width="60">
    <rect x="22" y="34" width="7" height="26" rx="3" fill="#EDE3D0" />
    <path d="M12 36q13-20 34-20 4 0 4 5 0 15-24 15z" fill="#C97B6B" />
    <circle cx="22" cy="26" r="2.6" fill="#F7F2E9" /><circle cx="32" cy="21" r="2" fill="#F7F2E9" />
    <rect x="50" y="42" width="6" height="18" rx="3" fill="#EDE3D0" />
    <path d="M42 44q10-15 25-15 3 0 3 4 0 11-18 11z" fill="#D4A24C" />
  </svg>);

const Lantern = () => (
  <svg viewBox="0 0 70 120" width="52">
    <path d="M33 120V38" stroke="#BCA285" strokeWidth="5" strokeLinecap="round" />
    <path d="M33 38q0-10 12-10h6" stroke="#BCA285" strokeWidth="4" fill="none" strokeLinecap="round" />
    <rect x="38" y="28" width="18" height="22" rx="4" fill="#E7D2BF" />
    <rect x="42" y="32" width="10" height="14" rx="2" fill="#D4A24C" />
    <circle cx="47" cy="39" r="2.4" fill="#F7F2E9" />
  </svg>);

const Birdhouse = () => (
  <svg viewBox="0 0 80 130" width="56">
    <path d="M40 130V70" stroke="#BCA285" strokeWidth="6" strokeLinecap="round" />
    <rect x="22" y="42" width="36" height="30" rx="4" fill="#D8BCA8" />
    <path d="M18 44L40 24l22 20z" fill="#C97B6B" />
    <circle cx="40" cy="57" r="6" fill="#2F3B2E" />
    <rect x="37" y="30" width="6" height="8" rx="3" fill="#BCA285" />
  </svg>);

const ITEMS = [
  { at: 5,  pos: { left: '3%',  bottom: '10%' }, Comp: Pebbles },
  { at: 15, pos: { right: '4%', bottom: '15%' }, Comp: Mushrooms },
  { at: 30, pos: { left: '6%',  bottom: '8%' },  Comp: Lantern },
  { at: 60, pos: { right: '7%', bottom: '12%' }, Comp: Birdhouse },
];

/* Hiasan muncul dengan pop lembut begitu ambangnya tercapai —
   karena derived dari data, tidak perlu disimpan di localStorage. */
export default function GardenDecor({ careDays }) {
  return (
    <div className="garden-decor" aria-hidden="true">
      {ITEMS.filter((it) => careDays >= it.at).map((it) => (
        <motion.div key={it.at} className="decor" style={it.pos}
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
          <it.Comp />
        </motion.div>
      ))}
    </div>
  );
}