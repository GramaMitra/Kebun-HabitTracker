import { useState, useEffect } from 'react';
import { Ico } from './Icons.jsx';
import Clock from './Clock.jsx';
import SoundControl from './SoundControl.jsx';
import { fmtID } from '../lib/garden.js';

function EditableTitle({ name, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  const save = () => { const v = draft.trim(); if (v) onChange(v); setEditing(false); };

  if (editing) return (
    <input className="name-edit" autoFocus value={draft} maxLength={24}
      aria-label="Nama kebun" onBlur={save}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') { setDraft(name); setEditing(false); }
      }} />
  );
  return (
    <h1 className="wordmark">
      <Ico n="leaf" size={22} style={{ color: '#7C8B6F' }} />
      <button type="button" className="title-btn" onClick={() => setEditing(true)} title="Ganti nama kebunmu">
        {name}<Ico n="pencil" size={13} style={{ opacity: .45 }} />
      </button>
    </h1>
  );
}

export default function Header({ now, dusk, name, onNameChange, onToggleLight, onPhoto, onPlant, sound }) {
  return (
    <header className="top">
      <div className="brand">
        <EditableTitle name={name} onChange={onNameChange} />
        <p className="brand-sub">{fmtID.format(now)} · <Clock /></p>
      </div>
      <div className="top-actions">
        <button type="button" className="btn btn-icon btn-ghost" onClick={onToggleLight}
          title="Mode siang / senja" aria-label="Ganti mode siang atau senja"><Ico n={dusk ? 'moon' : 'sun'} size={19} /></button>
        <SoundControl sound={sound} />
        <button type="button" className="btn btn-ghost" onClick={onPhoto} title="Ambil Foto Kebun">
          <Ico n="camera" size={17} /><span className="hide-sm">Ambil Foto Kebun</span>
        </button>
        <button type="button" className="btn btn-primary" onClick={onPlant}>
          <Ico n="plus" size={17} />Tanam Habit<span className="hide-xs"> Baru</span>
        </button>
      </div>
    </header>
  );
}