import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import PlantVisual from './PlantVisual.jsx';
import WaterButton from './WaterButton.jsx';
import { useIsMobile } from '../lib/useIsMobile.js';
import { SPECIES_BY_ID } from '../lib/species.js';
import { STAGE_LABEL, jitterOf, stageOf, wiltLevelOf, waterStatus } from '../lib/garden.js';

const canHover = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: hover)').matches;

/* Ukuran lewat breakpoint JS supaya tinggi kartu ikut mengecil beneran
   (bukan cuma CSS scale yang meninggalkan ruang kosong). */
const CARD_W_DESK = 232, CARD_W_MOB = 185;
const SCALE_DESK = 1.5, SCALE_MOB = 1.18;

const PlantCard = memo(function PlantCard({ habit, today, index = 0, onWater, onOpen, dropIn = false }) {
  const mobile = useIsMobile();
  const stage = stageOf(habit);
  const wilt = wiltLevelOf(habit, today);
  const status = waterStatus(habit, today);
  const [fx, setFx] = useState(0);
  const jit = jitterOf(habit.id);
  const cardW = (mobile ? CARD_W_MOB : CARD_W_DESK) + jit.w;
  const imgW = Math.round(cardW * (mobile ? SCALE_MOB : SCALE_DESK));

  const handleWater = (e) => {
    e.stopPropagation();
    if (status.state !== 'idle') return;
    setFx(fx + 1);
    onWater(habit.id);
  };

  const enter = dropIn
    ? { initial: { opacity: 0, y: -130, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 },
        transition: { type: 'spring', stiffness: 210, damping: 16 } }
    : { initial: { opacity: 0, y: 26 }, whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.4, ease: 'easeOut', delay: Math.min(index * 0.07, 0.42) } };

  return (
    <motion.div {...enter}
      whileHover={canHover ? { y: -4 } : undefined} whileTap={{ scale: 0.98 }}
      style={{ width: `min(${cardW}px, 100%)` }}>
      <article className="plant-card" style={{ '--jy': jit.y + 'px', '--jr': jit.r + 'deg' }}
        tabIndex="0" role="button" aria-label={`Buka detail ${habit.name}`}
        onClick={() => onOpen(habit.id)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(habit.id); } }}>
        <PlantVisual habit={habit} today={today} fx={fx} w={imgW} swayDelay={jit.d} />
        <h3 className="plant-name">{habit.name}</h3>
        <div className="plant-species">
          {SPECIES_BY_ID[habit.species].name}
          {wilt > 0 ? <span className="stage-flag wilt"> · sedang layu</span> : <span className="stage-flag"> · {STAGE_LABEL[stage]}</span>}
        </div>
        <div className="card-actions"><WaterButton status={status} onWater={handleWater} /></div>
      </article>
    </motion.div>
  );
});

export default PlantCard;