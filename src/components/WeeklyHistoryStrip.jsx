import { useState } from 'react';
import { addDays, keyToDate, dayKey, DOW, dowMon, isScheduled, fmtShort } from '../lib/garden.js';

const LABEL = { watered: 'disiram', missed: 'dilewati', rest: 'hari libur', pending: 'belum disiram' };

/* Riwayat sepekan: titik-titik lembut, bukan grafik batang.
   Hari dengan catatan bisa di-tap untuk membaca catatannya. */
export default function WeeklyHistoryStrip({ habit, today }) {
  const [openNote, setOpenNote] = useState(null);
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(keyToDate(today), -i));

  return (
    <div>
      <div className="week" aria-label="Riwayat sepekan terakhir">
        {days.map((d) => {
          const k = dayKey(d);
          const entry = habit.waterLog[k];
          const watered = !!(entry && entry.watered);
          const sched = isScheduled(habit, d);
          const isToday = k === today;
          const state = watered ? 'watered' : sched ? (isToday ? 'pending' : 'missed') : 'rest';
          const note = entry && entry.note;
          return (
            <button type="button" key={k} className={`day day-${state}${isToday ? ' day-today' : ''}`}
              title={`${DOW[dowMon(d)]} — ${LABEL[state]}`}
              onClick={() => note && setOpenNote(openNote === k ? null : k)}>
              <span className="lbl">{DOW[dowMon(d)]}</span>
              <span className="dot" />
              {note && <span className="note-dot" title="ada catatan" />}
            </button>
          );
        })}
      </div>
      {openNote && habit.waterLog[openNote] && habit.waterLog[openNote].note && (
        <p className="day-note">“{habit.waterLog[openNote].note}” — {fmtShort.format(keyToDate(openNote))}</p>
      )}
    </div>
  );
}