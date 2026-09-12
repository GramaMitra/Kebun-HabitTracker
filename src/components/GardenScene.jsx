import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantCard from './PlantCard.jsx';
import SkeletonPlant from './SkeletonPlant.jsx';
import EmptyGarden from './EmptyGarden.jsx';
import SnapshotMode from './SnapshotMode.jsx';
import AmbientLife from './AmbientLife.jsx';
import GardenDecor from './GardenDecor.jsx';
import { ASSET } from '../assets/index.js';

/* Hembusan angin: klik area KOSONG scene → semua tanaman bergoyang lebih kuat
   sebentar + kelopak berjatuhan. Goyangannya CSS class (.windy) — kartu tidak
   perlu re-render sama sekali. Pakai onClick (bukan pointerdown) supaya
   gestur scroll di mobile tidak ikut memicu angin. */
function Petals() {
  const petals = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    left: 3 + i * 11 + ((i * 37) % 8),
    dx: 46 + ((i * 53) % 70),
    dur: 1.7 + ((i * 29) % 10) / 12,
    del: ((i * 17) % 10) / 14,
    gold: i % 4 === 0,
  })), []);
  return (
    <div className="petals" aria-hidden="true">
      {petals.map((p, i) => (
        <span key={i} className={p.gold ? 'petal gold' : 'petal'}
          style={{ left: p.left + '%', '--dx': p.dx + 'px', '--dur': p.dur + 's', '--del': p.del + 's' }} />
      ))}
    </div>
  );
}

export default function GardenScene({ habits, today, loading, dusk, name, careDays,
  onWater, onOpen, onPlant, lastAddedId, photoMode, snapBusy, onSnapDownload, onSnapExit }) {
  const [gust, setGust] = useState(0);
  useEffect(() => {
    if (!gust) return;
    const t = setTimeout(() => setGust(0), 3200);
    return () => clearTimeout(t);
  }, [gust]);

  const handleSkyTap = (e) => {
    if (e.target !== e.currentTarget) return;
    setGust((g) => g + 1);
  };

  return (
    <motion.section className={`scene${dusk ? ' dusk' : ''}${gust ? ' windy' : ''}`} aria-label="Kebun saya"
      animate={{ scale: photoMode ? 1.025 : 1 }} transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ transformOrigin: '50% 40%' }}>
      <div className="scene-bg-blur" style={{ backgroundImage: `url(${ASSET.garden.day})`, opacity: dusk ? 0 : 1 }} />
      <div className="scene-bg-blur" style={{ backgroundImage: `url(${ASSET.garden.dusk})`, opacity: dusk ? 1 : 0 }} />
      <div className="scene-bg" style={{ backgroundImage: `url(${ASSET.garden.day})`, opacity: dusk ? 0 : 1 }} />
      <div className="scene-bg" style={{ backgroundImage: `url(${ASSET.garden.dusk})`, opacity: dusk ? 1 : 0 }} />
      <AmbientLife dusk={dusk} />
      <GardenDecor careDays={careDays} />
      {gust > 0 && <Petals key={gust} />}
      <div className="scene-inner" onClick={handleSkyTap}>
        {loading && <SkeletonPlant />}
        {!loading && habits.length === 0 && <EmptyGarden onPlant={onPlant} />}
        {!loading && habits.map((h, i) => (
          <PlantCard key={h.id} habit={h} today={today} index={i}
            onWater={onWater} onOpen={onOpen} dropIn={h.id === lastAddedId} />
        ))}
      </div>
      {!photoMode && !loading && habits.length > 0 && (
        <p className="scene-hint">sentuh area kosong — angin akan lewat</p>
      )}
      <AnimatePresence>
        {photoMode && (
          <SnapshotMode key="veil" name={name} count={habits.length}
            onDownload={onSnapDownload} onExit={onSnapExit} busy={snapBusy} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}