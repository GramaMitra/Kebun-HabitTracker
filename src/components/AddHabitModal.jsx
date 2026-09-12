import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ico } from './Icons.jsx';
import { PLANT_SPECIES } from '../lib/species.js';
import { ASSET } from '../assets/index.js';
import { DOW } from '../lib/garden.js';

export default function AddHabitModal({ initial, onClose, onSubmit }) {
  const editing = !!initial;
  const [name, setName] = useState(initial ? initial.name : '');
  const [species, setSpecies] = useState(initial ? initial.species : 'succulent');
  const [freqType, setFreqType] = useState(initial ? initial.frequency.type : 'daily');
  const [days, setDays] = useState(initial && initial.frequency.type === 'weekly' ? initial.frequency.days.slice() : [0, 2, 4]);
  const [touched, setTouched] = useState({});
  const [tried, setTried] = useState(false);

  const show = (k) => touched[k] || tried;
  const nameErr = show('name')
    ? (name.trim().length === 0 ? 'Kasih nama dulu — biar kamu kenal tanamannya.'
      : name.trim().length < 2 ? 'Masih terlalu pendek — minimal 2 huruf ya.' : '') : '';
  const daysErr = freqType === 'weekly' && show('days') && days.length === 0 ? 'Pilih minimal satu hari jadwalnya.' : '';
  const valid = name.trim().length >= 2 && (freqType === 'daily' || days.length > 0);

  const submit = (e) => {
    e.preventDefault();
    setTried({ name: true, days: true });
    if (!valid) return;
    onSubmit({
      name: name.trim(), species,
      frequency: freqType === 'daily' ? { type: 'daily' } : { type: 'weekly', days: [...days].sort((a, b) => a - b) },
    });
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal" role="dialog" aria-modal="true" aria-labelledby="m-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: 'easeOut' }} onClick={(e) => e.stopPropagation()}>
        <header className="modal-head">
          <h2 id="m-title">{editing ? 'Rawat ulang tanaman' : 'Tanam habit baru'}</h2>
          <button type="button" className="btn btn-icon btn-ghost" onClick={onClose} aria-label="Tutup"><Ico n="x" /></button>
        </header>

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="f-name">Nama habit</label>
            <input id="f-name" type="text" value={name} maxLength="40" className={nameErr ? 'invalid' : ''}
              placeholder="mis. membaca 10 menit sebelum tidur"
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))} />
            {nameErr && <p className="err" role="alert"><Ico n="x" size={13} />{nameErr}</p>}
          </div>

          <fieldset className="field">
            <legend>Pilih spesies</legend>
            <div role="radiogroup" aria-label="Spesies tanaman" className="sp-list">
              {PLANT_SPECIES.map((sp) => (
                <button type="button" key={sp.id} role="radio" aria-checked={species === sp.id}
                  className={`sp-row${species === sp.id ? ' sel' : ''}`} onClick={() => setSpecies(sp.id)}>
                  <img src={ASSET.plant[sp.id].growing} alt="" width="88" height="50" />
                  <span className="sp-txt"><strong>{sp.name}</strong><em>{sp.bestFor}</em></span>
                  {species === sp.id && <span className="sp-check"><Ico n="check" size={13} /></span>}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Seberapa sering dirawat?</legend>
            <div className="freq-pills">
              <button type="button" className={`pill${freqType === 'daily' ? ' sel' : ''}`} onClick={() => setFreqType('daily')}>Setiap hari</button>
              <button type="button" className={`pill${freqType === 'weekly' ? ' sel' : ''}`} onClick={() => setFreqType('weekly')}>Hari tertentu</button>
            </div>
            {freqType === 'weekly' && (
              <div className="day-chips">
                {DOW.map((d, i) => (
                  <button type="button" key={d} className={`chipday${days.includes(i) ? ' sel' : ''}`}
                    aria-pressed={days.includes(i)}
                    onClick={() => setDays((ds) => (ds.includes(i) ? ds.filter((x) => x !== i) : [...ds, i]))}>{d}</button>
                ))}
              </div>
            )}
            {daysErr && <p className="err" role="alert"><Ico n="x" size={13} />{daysErr}</p>}
          </fieldset>

          <button type="submit" className="btn btn-primary btn-block">{editing ? 'Simpan Perubahan' : 'Tanam di Kebun'}</button>
        </form>
      </motion.div>
    </motion.div>
  );
}