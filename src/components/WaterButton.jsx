import { Ico } from './Icons.jsx';

export default function WaterButton({ status, onWater }) {
  if (status.state === 'done') return <span className="chip chip-done"><Ico n="check" size={15} />Sip, disiram hari ini 🌱</span>;
  if (status.state === 'rest') return <span className="chip chip-rest">Hari libur — kembali {status.next}</span>;
  return (
    <button type="button" className="btn btn-primary btn-water" onClick={onWater}>
      <Ico n="drop" size={17} />Siram Hari Ini
    </button>
  );
}