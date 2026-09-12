import { useState } from 'react';
import { motion } from 'framer-motion';
import PlantVisual from './PlantVisual.jsx';
import WaterButton from './WaterButton.jsx';
import WeeklyHistoryStrip from './WeeklyHistoryStrip.jsx';
import { Ico } from './Icons.jsx';
import { SPECIES_BY_ID } from '../lib/species.js';
import { STAGE_LABEL, stageOf, wiltLevelOf, waterStatus, streakOf, careDaysOf,
  freqLabel, nextStageInfo, lastWateredLabel, keyToDate, fmtShort } from '../lib/garden.js';

export default function PlantDetail({ habit, today, onClose, onWater, onUnwater, onEdit, onDelete, onNote }) {
  const status = waterStatus(habit, today);
  const stage = stageOf(habit);
  const wilt = wiltLevelOf(habit, today);
  const sp = SPECIES_BY_ID[habit.species];
  const [fx, setFx] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const todayEntry = habit.waterLog[today];
  const notes = Object.keys(habit.waterLog).filter((k) => habit.waterLog[k].note).sort().reverse().slice(0, 5);
  const next = nextStageInfo(habit);

  const handleWater = () => { if (status.state !== 'idle') return; setFx(fx + 1); onWater(habit.id); };

  return (
    <motion.div className="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="sheet" role="dialog" aria-modal="true" aria-label={`Detail ${habit.name}`}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sheet-x" onClick={onClose} aria-label="Tutup"><Ico n="x" /></button>

        <div className="sheet-head">
          <PlantVisual habit={habit} today={today} fx={fx} w={360} />
          <div className="sheet-title">
            <h2>{habit.name}</h2>
            <p className="plant-species">{sp.name} · {wilt > 0 ? 'sedang layu' : STAGE_LABEL[stage]}</p>
            <p className="sp-desc">{sp.description}</p>
            <div className="card-actions left"><WaterButton status={status} onWater={handleWater} /></div>
            {todayEntry && todayEntry.watered && (
              <button type="button" className="linklike" onClick={() => onUnwater(habit.id)}
                title="Hari ini kembali jadi belum disiram — catatan hari ini ikut terhapus">
                Urungkan siraman hari ini
              </button>
            )}
          </div>
        </div>

        <div className="fact-list">
          <div className="factrow"><span>Terakhir disiram</span><strong>{lastWateredLabel(habit, today)}</strong></div>
          <div className="factrow"><span>Dirawat berurutan</span><strong>{streakOf(habit, today)} hari</strong></div>
          <div className="factrow"><span>Total hari dirawat</span><strong>{careDaysOf(habit)} hari</strong></div>
          <div className="factrow"><span>Jadwal</span><strong>{freqLabel(habit.frequency)}</strong></div>
          <div className="factrow"><span>Tahap berikutnya</span><strong>{next ? `${STAGE_LABEL[next.s]} · ${next.left} hari lagi` : 'sudah berbunga penuh'}</strong></div>
        </div>

        <h3 className="mini-title">Sepekan terakhir</h3>
        <WeeklyHistoryStrip habit={habit} today={today} />

        {todayEntry && todayEntry.watered && !todayEntry.note && (
          <div className="note-compose">
            <p className="note-hint">Kenapa hari ini terasa berhasil — atau susah? Simpan sebagai catatan kecil (opsional).</p>
            <textarea rows="2" aria-label="Catatan hari ini"
              placeholder="mis. baru sadar kalau pagi-pagi lebih gampang mulai…"
              value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
            <button type="button" className="btn btn-ghost btn-sm"
              onClick={() => { if (noteDraft.trim()) { onNote(habit.id, today, noteDraft.trim()); setNoteDraft(''); } }}>
              <Ico n="note" size={15} />Simpan catatan
            </button>
          </div>
        )}
        {todayEntry && todayEntry.note && <p className="day-note today">Catatan hari ini: “{todayEntry.note}”</p>}

        <h3 className="mini-title">Catatan tersimpan</h3>
        {notes.length
          ? <ul className="note-list">{notes.map((k) => (
              <li key={k}><span className="note-date">{fmtShort.format(keyToDate(k))}</span>“{habit.waterLog[k].note}”</li>
            ))}</ul>
          : <p className="muted">Belum ada catatan. Catatan kecil saat menyiram bisa kamu baca lagi di sini.</p>}

        <div className="sheet-actions">
          <button type="button" className="btn btn-ghost" onClick={() => onEdit(habit)}><Ico n="pencil" size={16} />Edit</button>
          {!confirming
            ? <button type="button" className="btn btn-ghost danger" onClick={() => setConfirming(true)}><Ico n="trash" size={16} />Hapus</button>
            : (
              <div className="confirm">
                <p>Hapus <strong>{habit.name}</strong> beserta seluruh riwayatnya dari kebun?</p>
                <div>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onDelete(habit.id)}>Ya, hapus tanaman ini</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Batal</button>
                </div>
              </div>
            )}
        </div>
      </motion.div>
    </motion.div>
  );
}