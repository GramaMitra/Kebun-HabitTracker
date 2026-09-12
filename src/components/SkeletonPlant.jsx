import silhouette from '../assets/pot-silhouette.svg';
import { jitterOf } from '../lib/garden.js';

/* Skeleton berbentuk siluet pot + tanaman (bukan kotak generik),
   memakai jitter yang sama supaya transisi ke kartu asli tidak "lompat". */
export default function SkeletonPlant() {
  return ['a1', 'b2', 'c3'].map((k, i) => {
    const jit = jitterOf(k);
    return (
      <div key={k} className="skel-card" aria-hidden="true"
        style={{ '--jy': jit.y + 'px', '--jr': jit.r + 'deg', width: `min(${190 + jit.w}px, 100%)` }}>
        <div className="skel">
          <img src={silhouette} alt="" />
          <div className="shim" style={{ animationDelay: i * 0.15 + 's' }} />
        </div>
        <div className="skel-line" style={{ width: '62%' }} />
        <div className="skel-line" style={{ width: '44%' }} />
      </div>
    );
  });
}