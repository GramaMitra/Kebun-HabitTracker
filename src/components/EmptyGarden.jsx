import { motion } from 'framer-motion';
import { ASSET } from '../assets/index.js';
import { Ico } from './Icons.jsx';

export default function EmptyGarden({ onPlant }) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="plate">
        <div className="pot-idle"><img src={ASSET.plant.succulent.seed} alt="" width="260" /></div>
        <h2 className="empty-title">Kebunmu masih kosong</h2>
        <p className="empty-sub">Tanah di sini subur dan sabar — tinggal menunggu benih pertamamu. Mulai dari habit yang paling kecil saja.</p>
        <button type="button" className="btn btn-primary" onClick={onPlant}><Ico n="plus" size={17} />Tanam Habit Pertama</button>
      </div>
    </motion.div>
  );
}