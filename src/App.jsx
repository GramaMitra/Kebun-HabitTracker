import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import GardenScene from './components/GardenScene.jsx';
import PlantDetail from './components/PlantDetail.jsx';
import AddHabitModal from './components/AddHabitModal.jsx';
import DevPanel from './components/DevPanel.jsx';
import { DECOR_MILESTONES } from './components/GardenDecor.jsx';
import { Ico } from './components/Icons.jsx';
import { useHabits } from './hooks/useHabits.js';
import { useGardenName } from './hooks/useGardenName.js';
import { useGardenSnapshot } from './hooks/useGardenSnapshot.js';
import { DEV_MODE } from './lib/dev.js';
import { PLANT_SPECIES } from './lib/species.js';
import { dayKey, fmtID, dailyLine, addDays, isScheduled, isWateredOn, waterStatus, wiltLevelOf, careDaysOf } from './lib/garden.js';
import { useAmbientSound } from './hooks/useAmbientSound.js';

function EveningBanner({ count, onDismiss }) {
  return (
    <motion.div className="banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      <Ico n="moon" size={18} />
      <p className="banner-text">Malam hampir tiba — {count} tanaman masih menunggu disiram.</p>
      <button type="button" className="banner-x" onClick={onDismiss} aria-label="Tutup pengingat"><Ico n="x" size={15} /></button>
    </motion.div>
  );
}

function GardenStats({ habits, today, now, careTotal }) {
  if (!habits.length) return null;
  const wilted = habits.filter((h) => wiltLevelOf(h, today) > 0).length;
  const top = [...habits].sort((a, b) => careDaysOf(b) - careDaysOf(a))[0];
  const nextDecor = DECOR_MILESTONES.find((m) => m.days > careTotal);
  return (
    <section className="stats">
      <h2 className="stats-title"><Ico n="leaf" size={16} />Catatan Kebun</h2>
      <p className="daily-line">“{dailyLine(now)}”</p>
      <p>
        Sejauh ini kamu sudah merawat kebun ini <strong>{careTotal} hari</strong>
        {wilted ? `, dan ${wilted} tanaman sedang layu menunggu` : ''}.
        Tanaman paling rajin disiram: <strong>{top.name}</strong> — {careDaysOf(top)} hari.
        {nextDecor && <> Hiasan berikutnya: <strong>{nextDecor.label}</strong>, terbuka setelah {nextDecor.days} hari dirawat.</>}
      </p>
    </section>
  );
}

export default function App() {
  const { habits, addHabit, updateHabit, removeHabit, water, unwater, setNote, clearAll } = useHabits();
  const [gardenName, setGardenName] = useGardenName();

  /* Tick 30 detik untuk logika hari; jam:menit:detik ditangani <Clock> sendiri */
  const [realNow, setRealNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setRealNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  /* Dev time-travel: semua bagian app membaca "now" yang sudah digeser */
  const [devOffset, setDevOffset] = useState(0);
  const now = useMemo(() => (devOffset ? addDays(realNow, devOffset) : realNow), [realNow, devOffset]);
  const today = dayKey(now);
  const hour = now.getHours();

  const [modal, setModal] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [photoMode, setPhotoMode] = useState(false);
  const [lightPref, setLightPref] = useState('auto');
  const [bannerOff, setBannerOff] = useState(false);
  const [lastAddedId, setLastAddedId] = useState(null);
  const [snapBusy, setSnapBusy] = useState(false);

  const dusk = lightPref === 'auto' ? (hour >= 17 || hour < 6) : lightPref === 'dusk';
  const sound = useAmbientSound(dusk);
  const detail = habits && detailId ? habits.find((h) => h.id === detailId) : null;
  const careTotal = habits ? habits.reduce((a, h) => a + careDaysOf(h), 0) : 0;
  const snap = useGardenSnapshot(habits || [], dusk, gardenName, today);

  useEffect(() => {
    const f = (e) => { if (e.key === 'Escape') { setModal(null); setDetailId(null); setPhotoMode(false); } };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, []);

  const handleWater = useCallback((id) => { water(id, today); }, [water, today]);
  const handleUnwater = useCallback((id) => { unwater(id, today); }, [unwater, today]);
  const handleOpen = useCallback((id) => { setDetailId(id); }, []);

  const openAdd = () => setModal({});
  const openEdit = (h) => setModal({ edit: h });
  const handleSubmit = ({ name, species, frequency }) => {
    if (modal && modal.edit) {
      updateHabit(modal.edit.id, { name, species, frequency });
    } else {
      const id = addHabit(name, species, frequency);
      setLastAddedId(id);
      setTimeout(() => setLastAddedId(null), 1600);
    }
    setModal(null);
  };
  const handleDelete = (id) => { removeHabit(id); setDetailId(null); };
  const handleDownload = async () => { setSnapBusy(true); try { await snap(); } finally { setSnapBusy(false); } };

  /* Aksi dev */
  const devWaterAll = () => habits.forEach((h) => { if (waterStatus(h, today).state === 'idle') water(h.id, today); });
  const devSeedSample = () => {
    const names = { succulent: 'Minum air putih', flower: 'Menggambar 15 menit', tree: 'Belajar bahasa', herb: 'Jalan kaki pagi', vine: 'Telepon keluarga' };
    PLANT_SPECIES.forEach((sp, i) => {
      const freq = sp.id === 'vine' ? { type: 'weekly', days: [0, 3] } : { type: 'daily' };
      const id = addHabit(names[sp.id], sp.id, freq);
      const start = addDays(now, -(18 + i));
      const log = {};
      for (let d = new Date(start); d <= now; d = addDays(d, 1)) {
        if (isScheduled({ frequency: freq }, d) && Math.random() < 0.75) {
          log[dayKey(d)] = { watered: true, at: d.getTime(), note: null };
        }
      }
      updateHabit(id, { createdAt: start.getTime(), waterLog: log });
    });
  };

  const unwatered = habits ? habits.filter((h) => isScheduled(h, now) && !isWateredOn(h, today)).length : 0;
  const showBanner = !bannerOff && !photoMode && hour >= 19 && unwatered > 0 && !!habits && habits.length > 0;

  return (
    <div className={`app${photoMode ? ' photo-mode' : ''}`}>
      <motion.div className="chrome" animate={{ opacity: photoMode ? 0 : 1 }} transition={{ duration: 0.4 }}
        style={{ pointerEvents: photoMode ? 'none' : 'auto' }}>
        <Header now={now} dusk={dusk} name={gardenName} onNameChange={setGardenName}
          sound={sound}
          onToggleLight={() => setLightPref((p) => (p === 'auto' ? 'day' : p === 'day' ? 'dusk' : 'auto'))}
          onPhoto={() => setPhotoMode(true)} onPlant={openAdd} />
        <AnimatePresence>
          {showBanner && <EveningBanner key="b" count={unwatered} onDismiss={() => setBannerOff(true)} />}
        </AnimatePresence>
      </motion.div>

      <GardenScene habits={habits || []} today={today} loading={!habits} dusk={dusk}
        name={gardenName} careDays={careTotal}
        onWater={handleWater} onOpen={handleOpen} onPlant={openAdd}
        lastAddedId={lastAddedId} photoMode={photoMode}
        snapBusy={snapBusy} onSnapDownload={handleDownload} onSnapExit={() => setPhotoMode(false)} />

      <motion.div className="chrome" animate={{ opacity: photoMode ? 0 : 1 }} transition={{ duration: 0.4 }}
        style={{ pointerEvents: photoMode ? 'none' : 'auto' }}>
        <GardenStats habits={habits || []} today={today} now={now} careTotal={careTotal} />
        <footer className="foot">Kebun menyimpan seluruh data di perangkat ini — tidak ada yang dikirim ke mana pun.</footer>
      </motion.div>

      <AnimatePresence>
        {modal && <AddHabitModal key={modal.edit ? modal.edit.id : 'add'} initial={modal.edit}
          onClose={() => setModal(null)} onSubmit={handleSubmit} />}
      </AnimatePresence>
      <AnimatePresence>
        {detail && <PlantDetail key={detail.id} habit={detail} today={today}
          onClose={() => setDetailId(null)} onWater={handleWater} onUnwater={handleUnwater}
          onEdit={openEdit} onDelete={handleDelete} onNote={setNote} />}
      </AnimatePresence>

      {DEV_MODE && !photoMode && (
        <DevPanel now={now} offset={devOffset} setOffset={setDevOffset}
          onWaterAll={devWaterAll} onSeedSample={devSeedSample}
          onClear={clearAll} onLight={setLightPref} />
      )}
    </div>
  );
}