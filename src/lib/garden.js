/* Util tanggal + seluruh logika pertumbuhan/layu.
   Semuanya murni DERIVED dari waterLog — localStorage hanya menyimpan fakta
   ("tanggal X disiram"), sehingga progress tidak pernah tersimpan ganda dan
   tidak mungkin hilang/reset. Filosofi anti-punishing ada di sini. */

export const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const keyToDate = (k) => { const [a, b, c] = k.split('-').map(Number); return new Date(a, b - 1, c); };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const DOW = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
export const dowMon = (d) => (d.getDay() + 6) % 7;
export const fmtID = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
export const fmtTime = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
export const fmtShort = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' });

export const STAGE_LABEL = { seed: 'Benih', sprout: 'Tunas', growing: 'Tumbuh', bloom: 'Berbunga' };
export const STAGE_VIS_W = { seed: 62, sprout: 78, growing: 96, bloom: 114 };    /* ukuran visual di kartu */
export const STAGE_CARD_W = { seed: 162, sprout: 180, growing: 198, bloom: 218 }; /* ruang kartu per tahap */
export const THRESH = [['sprout', 3], ['growing', 7], ['bloom', 14]];            /* hari dirawat per tahap */

export const isScheduled = (h, d) => h.frequency.type === 'daily' || h.frequency.days.includes(dowMon(d));
export const isWateredOn = (h, k) => !!(h.waterLog[k] && h.waterLog[k].watered);
export const careDaysOf = (h) => Object.values(h.waterLog).filter((e) => e.watered).length;
export const stageOf = (h) => {
  const c = careDaysOf(h);
  let st = 'seed';
  for (const [s, t] of THRESH) if (c >= t) st = s;
  return st;
};
export const nextStageInfo = (h) => {
  const c = careDaysOf(h);
  for (const [s, t] of THRESH) if (c < t) return { s, left: t - c };
  return null;
};

/* Berapa hari jadwal berturut-turut yang terlewat sejak terakhir disiram.
   Skala 1/3 → 2/3 → 3/3 = layu bertahap; progress historis TIDAK pernah hilang. */
export function missedRun(h, todayK) {
  let d = addDays(keyToDate(todayK), -1), n = 0, guard = 0;
  const start = new Date(h.createdAt); start.setHours(0, 0, 0, 0);
  while (d >= start && guard++ < 90) {
    if (isScheduled(h, d)) {
      if (isWateredOn(h, dayKey(d))) break;
      n++;
    }
    d = addDays(d, -1);
  }
  return n;
}

export const wiltLevelOf = (h, todayK) => (isWateredOn(h, todayK) ? 0 : Math.min(1, missedRun(h, todayK) / 3));

export function streakOf(h, todayK) {
  let d = keyToDate(todayK), s = 0, guard = 0;
  const start = new Date(h.createdAt); start.setHours(0, 0, 0, 0);
  if (isScheduled(h, d) && !isWateredOn(h, dayKey(d))) d = addDays(d, -1);
  while (d >= start && guard++ < 400) {
    if (isScheduled(h, d)) {
      if (isWateredOn(h, dayKey(d))) s++;
      else break;
    }
    d = addDays(d, -1);
  }
  return s;
}

export function nextVisitName(h, todayK) {
  let d = addDays(keyToDate(todayK), 1);
  for (let i = 0; i < 14; i++) {
    if (isScheduled(h, d)) return DOW[dowMon(d)];
    d = addDays(d, 1);
  }
  return 'besok';
}

export function lastWateredLabel(h, todayK) {
  const ks = Object.keys(h.waterLog).filter((k) => h.waterLog[k].watered).sort();
  if (!ks.length) return 'belum pernah';
  const diff = Math.round((keyToDate(todayK) - keyToDate(ks[ks.length - 1])) / 864e5);
  return diff <= 0 ? 'hari ini' : diff === 1 ? 'kemarin' : diff + ' hari lalu';
}

export function waterStatus(h, todayK) {
  if (!isScheduled(h, keyToDate(todayK))) return { state: 'rest', next: nextVisitName(h, todayK) };
  if (isWateredOn(h, todayK)) return { state: 'done' };
  return { state: 'idle' };
}

export const freqLabel = (f) =>
  f.type === 'daily' ? 'Setiap hari' : f.days.slice().sort((a, b) => a - b).map((d) => DOW[d]).join(', ');

/* Jitter organik: deterministik dari id hash — konsisten tiap render,
   jadi layout kebun "tumbuh alami" tapi tidak bergeser acak antar render. */
export function hash32(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export const jitterOf = (id) => {
  const h = hash32(id);
  return { y: (h % 21) - 10, r: (((h >>> 7) % 9) - 4) * 0.55, w: ((h >>> 13) % 17) - 8, d: ((h >>> 5) % 40) / 10 };
};

export const DAILY_LINES = [
  'Kebun ini tidak pernah buru-buru — kamu juga tidak perlu.',
  'Benih yang paling sabar pun akhirnya pecah.',
  'Merawat sedikit hari ini lebih baik daripada merawat sempurna bulan depan.',
  'Ada musim untuk mekar, dan ada musim untuk berakar.',
  'Tanaman tidak menghitung hari yang kamu lewatkan; ia hanya menunggu kamu kembali.',
  'Hari yang berat tetap tercatat sebagai hari yang kamu lalui.',
  'Yang tumbuh pelan biasanya yang tumbuh paling kuat.',
  'Konsistensi bukan tentang api besar, tapi bara yang tidak padam.',
  'Tidak apa-apa hari ini cuma menyiram satu tanaman.',
  'Ritme kamu tidak harus sama dengan ritme siapa pun.',
  'Bunga tidak sedang berlomba dengan bunga di kebun sebelah.',
  'Istirahat juga bagian dari merawat.',
  'Tanah yang tampak sepi sedang bekerja diam-diam.',
  'Besok punya jadwalnya sendiri; malam ini, tidur yang cukup.',
  'Kamu sudah datang hari ini — itu setengah dari pekerjaan.',
  'Kebun mana pun mulai dari satu keputusan kecil untuk mulai.',
];

export const dailyLine = (d = new Date()) => {
  const doy = Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5);
  return DAILY_LINES[((doy % DAILY_LINES.length) + DAILY_LINES.length) % DAILY_LINES.length];
};