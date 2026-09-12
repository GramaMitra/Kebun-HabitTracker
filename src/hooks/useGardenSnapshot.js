import { useCallback } from 'react';
import { ASSET } from '../assets/index.js';
import { dayKey, keyToDate, stageOf, wiltLevelOf, jitterOf, fmtID } from '../lib/garden.js';

const loadImg = (src) => new Promise((res, rej) => {
  const im = new Image();
  im.onload = () => res(im);
  im.onerror = rej;
  im.src = src;
});

const rr = (g, x, y, w, h, r) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

/* Font dimuat EKSPLISIT sebelum menggambar — tanpa ini teks canvas bisa
   jatuh ke font fallback (penyebab "tulisan hampir tak terlihat"). */
const ensureFonts = async () => {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load('400 72px "Instrument Serif"', 'Kebun'),
      document.fonts.load('italic 30px "Instrument Serif"', 'dirawat pelan-pelan'),
      document.fonts.load('800 24px "Nunito Sans"', 'tanaman 0123'),
      document.fonts.load('700 21px "Nunito Sans"', 'abcdef ABCDEF'),
    ]);
  } catch (e) {}
};

/* Latar foto = tampilan di layar: langit blur (regangan ⅓ atas aset) +
   strip tajam 16:9 pas-lebar di dasar, melebur ke atas. Tidak ada zoom. */
function paintLayeredBg(g, bg, W, H) {
  g.save();
  if ('filter' in g) g.filter = 'blur(26px)'; /* browser lama: fallback tanpa blur, tetap mulus */
  g.drawImage(bg, 0, 0, bg.width, bg.height / 3, -60, -60, W + 120, H + 120);
  g.restore();

  const stripH = Math.round((W * 9) / 16);
  const oc = document.createElement('canvas');
  oc.width = W; oc.height = stripH;
  const og = oc.getContext('2d');
  og.drawImage(bg, 0, 0, bg.width, bg.height, 0, 0, W, stripH);
  og.globalCompositeOperation = 'destination-in';
  const grad = og.createLinearGradient(0, 0, 0, stripH);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.2, 'rgba(0,0,0,.9)');
  grad.addColorStop(0.32, 'rgba(0,0,0,1)');
  og.fillStyle = grad;
  og.fillRect(0, 0, W, stripH);
  g.drawImage(oc, 0, H - stripH);
}

/* Plate semi-transparan (kartu krem): kontras dari permukaan + shadow lembut. */
function plate(g, x, y, w, h, r = 24, alpha = 0.86) {
  g.save();
  g.shadowColor = 'rgba(47,59,46,.16)';
  g.shadowBlur = 22;
  g.shadowOffsetY = 8;
  g.fillStyle = `rgba(255,253,247,${alpha})`;
  rr(g, x, y, w, h, r);
  g.fill();
  g.restore();
  g.strokeStyle = 'rgba(227,219,200,.95)';
  g.lineWidth = 2;
  rr(g, x, y, w, h, r);
  g.stroke();
}

/* Nama habit terlalu panjang → dipotong dengan elipsis, tidak pernah luber. */
const fitText = (g, text, maxW) => {
  let t = text;
  while (g.measureText(t).width > maxW && t.length > 2) t = t.slice(0, -2);
  return t === text ? t : t.trimEnd() + '…';
};

export function useGardenSnapshot(habits, dusk, name, today) {
  return useCallback(async () => {
    await ensureFonts();
    const W = 1000;
    const n = habits.length;

    /* Tata letak dihitung dulu → tinggi kanvas menyusul (tidak ada ruang mati). */
    const per = n ? Math.min(4, Math.max(2, Math.ceil(Math.sqrt(n * 1.4)))) : 1;
    const cardW = n ? Math.min(232, Math.floor((W - 150) / per) - 16) : 232;
    const imgW = cardW - 28;
    const imgH = Math.round((imgW * 9) / 16);
    const cardH = 14 + imgH + 56;
    const rowPitch = cardH + 30;
    const rows = n ? Math.ceil(n / per) : 0;
    const titleTop = 64, titleH = 158;
    const gridTop = titleTop + titleH + 56;
    const contentBottom = n ? gridTop + (rows - 1) * rowPitch + cardH : 0;
    const H = n ? Math.max(1040, contentBottom + 208) : 1250;

    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');

    const bg = await loadImg(dusk ? ASSET.garden.dusk : ASSET.garden.day);
    paintLayeredBg(g, bg, W, H);
    g.textAlign = 'center';

    /* Judul: nama kebun + tanggal, plate semi-transparan di atas.
       Font menyusut otomatis kalau namamu panjang. */
    let fs = 72;
    g.font = `400 ${fs}px "Instrument Serif", serif`;
    while (g.measureText(name).width > W - 260 && fs > 38) {
      fs -= 4;
      g.font = `400 ${fs}px "Instrument Serif", serif`;
    }
    const sub = `${fmtID.format(keyToDate(today))}  ·  ${n} tanaman`;
    g.font = '800 24px "Nunito Sans", sans-serif';
    const subW = g.measureText(sub).width;
    g.font = `400 ${fs}px "Instrument Serif", serif`;
    const titleW = g.measureText(name).width;
    const pw = Math.min(W - 56, Math.max(titleW, subW) + 110);
    plate(g, W / 2 - pw / 2, titleTop, pw, titleH, 30, 0.88);
    g.fillStyle = '#2F3B2E';
    g.font = `400 ${fs}px "Instrument Serif", serif`;
    g.fillText(name, W / 2, titleTop + 88);
    g.fillStyle = '#4a4638';
    g.font = '800 24px "Nunito Sans", sans-serif';
    g.fillText(sub, W / 2, titleTop + 132);

    if (!n) {
      const pot = await loadImg(ASSET.plant.succulent.seed);
      g.drawImage(pot, W / 2 - 170, 540, 340, Math.round(340 * 9 / 16));
      const line = 'kebunmu menunggu benih pertama';
      g.font = 'italic 30px "Instrument Serif", serif';
      const lw = g.measureText(line).width + 96;
      plate(g, W / 2 - lw / 2, 790, lw, 62, 20, 0.86);
      g.fillStyle = '#2F3B2E';
      g.fillText(line, W / 2, 831);
    } else {
      /* Tiap tanaman: kartu semi-transparan + gambar utuh + nama.
         Jitter deterministik yang sama dengan tampilan layar, dan tetap
         "jujur": tanaman yang sedang layu difoto dalam keadaan layu. */
      for (let row = 0; row < rows; row++) {
        const inRow = Math.min(per, n - row * per);
        const rowW = inRow * cardW + (inRow - 1) * 24;
        const x0 = W / 2 - rowW / 2;
        for (let col = 0; col < inRow; col++) {
          const h = habits[row * per + col];
          const jit = jitterOf(h.id);
          const x = Math.round(x0 + col * (cardW + 24) + jit.w * 1.4);
          const y = Math.round(gridTop + row * rowPitch + jit.y);
          plate(g, x, y, cardW, cardH, 22, 0.85);
          const stage = wiltLevelOf(h, today) > 0 ? 'wilted' : stageOf(h);
          const im = await loadImg(ASSET.plant[h.species][stage]);
          g.drawImage(im, x + 14, y + 12, imgW, imgH);
          g.font = '700 21px "Nunito Sans", sans-serif';
          g.fillStyle = '#2F3B2E';
          g.fillText(fitText(g, h.name, cardW - 24), x + cardW / 2, y + 12 + imgH + 36);
        }
      }
    }

    /* Caption bawah + bingkai luar halus. */
    const cap = 'dirawat pelan-pelan, hari demi hari';
    g.font = 'italic 30px "Instrument Serif", serif';
    const cw2 = g.measureText(cap).width + 100;
    plate(g, W / 2 - cw2 / 2, H - 128, cw2, 62, 20, 0.86);
    g.fillStyle = '#2F3B2E';
    g.fillText(cap, W / 2, H - 87);

    g.strokeStyle = 'rgba(47,59,46,.15)';
    g.lineWidth = 2;
    rr(g, 18, 18, W - 36, H - 36, 26);
    g.stroke();

    const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
    if (!blob) return;
    const a = document.createElement('a');
    a.download = 'kebun-' + dayKey() + '.png';
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 6000);
  }, [habits, dusk, name, today]);
}