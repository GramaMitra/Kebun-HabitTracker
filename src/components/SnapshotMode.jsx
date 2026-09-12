import { motion } from 'framer-motion';
import { Ico } from './Icons.jsx';

export default function SnapshotMode({ name, count, onDownload, onExit, busy }) {
  return (
    <>
      <motion.div className="lightveil" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} />
      <motion.div className="photo-caption" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="photo-plate">
          <p className="photo-title">{name}</p>
          <p className="photo-sub">{count} tanaman · dirawat pelan-pelan</p>
        </div>
      </motion.div>
      <motion.div className="photo-bar" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <button type="button" className="btn btn-gold" onClick={onDownload} disabled={busy}>
          <Ico n="download" size={17} />{busy ? 'Menyiapkan…' : 'Unduh Gambar'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onExit}>Kembali</button>
      </motion.div>
    </>
  );
}