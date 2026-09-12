import { dayKey } from '../lib/garden.js';

export default function DevPanel({ now, offset, setOffset, onWaterAll, onSeedSample, onClear, onLight }) {
  return (
    <div className="devpanel" role="toolbar" aria-label="Panel pengembang">
      <div className="dev-head">DEV · {dayKey(now)}{offset ? ` (offset ${offset > 0 ? '+' : ''}${offset}h)` : ''}</div>
      <div className="dev-row">
        <button onClick={() => setOffset(offset - 1)}>−1 hari</button>
        <button onClick={() => setOffset(0)}>reset</button>
        <button onClick={() => setOffset(offset + 1)}>+1 hari</button>
      </div>
      <div className="dev-row">
        <button onClick={onWaterAll}>Siram semua</button>
        <button onClick={onSeedSample}>Kebun contoh</button>
        <button onClick={onClear}>Hapus semua</button>
      </div>
      <div className="dev-row">
        <button onClick={() => onLight('day')}>Siang</button>
        <button onClick={() => onLight('dusk')}>Senja</button>
        <button onClick={() => onLight('auto')}>Auto</button>
      </div>
    </div>
  );
}