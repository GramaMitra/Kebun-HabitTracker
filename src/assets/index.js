/* Resolver aset. File .svg di bawah adalah placeholder dengan pola nama yang
   SAMA PERSIS dengan aset final spesifikasi (/plants/<spesies>/<tahap>.png).
   Begitu PNG hasil Gemini di-drop ke folder yang sama, resolver otomatis
   memilih PNG di atas SVG — tanpa satu baris kode berubah. */

const plantFiles = import.meta.glob('./plants/**/*.{svg,png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });
const gardenFiles = import.meta.glob('./garden/*.{svg,png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' });

const RANK = { svg: 0, jpg: 1, jpeg: 1, webp: 2, png: 3 };

export const ASSET = { plant: {}, garden: {} };

const plantRank = {};
for (const [path, url] of Object.entries(plantFiles)) {
  const m = path.match(/plants\/([^/]+)\/([^/]+)\.([a-z]+)$/i);
  if (!m) continue;
  const [, species, stage, ext] = m;
  const r = RANK[ext.toLowerCase()] ?? 0;
  const key = species + '/' + stage;
  if (plantRank[key] !== undefined && r <= plantRank[key]) continue;
  plantRank[key] = r;
  ASSET.plant[species] = ASSET.plant[species] || {};
  ASSET.plant[species][stage] = url;
}

const gardenRank = {};
for (const [path, url] of Object.entries(gardenFiles)) {
  const m = path.match(/garden\/garden-bg-(day|dusk)\.([a-z]+)$/i);
  if (!m) continue;
  const [, name, ext] = m;
  const r = RANK[ext.toLowerCase()] ?? 0;
  if (gardenRank[name] !== undefined && r <= gardenRank[name]) continue;
  gardenRank[name] = r;
  ASSET.garden[name] = url;
}