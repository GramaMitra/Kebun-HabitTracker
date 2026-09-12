import { useState, useEffect, useRef, useCallback } from 'react';

/* ==== BATAS KERAS VOLUME ====
   Slider 100% = nilai ini. Ubah angka ini kalau mau maksimumnya berbeda. */
export const SOUND_MAX_VOLUME = 0.15;

/* ==== DURASI FADE (ms) ====
   Fade in saat musik dinyalakan, fade out saat dimatikan,
   crossfade pendek saat berganti track siang ↔ senja. */
export const FADE_MS = 900;

const LS_KEY = 'kebun.sound';

/* Path ikut base URL Vite — aman juga kalau nanti di-deploy ke
   GitHub Pages subpath (mis. base: '/kebun/'). */
const BASE = import.meta.env.BASE_URL || '/';
const SRC_DAY = BASE + 'sounds/garden-day.mp3';
const SRC_DUSK = BASE + 'sounds/garden-dusk.mp3';

export function useAmbientSound(dusk) {
  const [on, setOn] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(LS_KEY)); return !!(s && s.on); } catch (e) { return false; }
  });
  const [vol, setVol] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(LS_KEY)); return s && typeof s.v === 'number' ? s.v : 0.6; } catch (e) { return 0.6; }
  });
  const audioRef = useRef(null);
  const fadeRef = useRef(null);
  /* Mirror nilai terbaru supaya callback fade (async) tidak dapat nilai basi */
  const stateRef = useRef({});
  stateRef.current = { on, vol, dusk };
  const mountedRef = useRef(false);

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify({ on, v: vol })); } catch (e) {} }, [on, vol]);

  const stopFade = useCallback(() => {
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
  }, []);

  /* Ramp volume menuju target (skala slider 0..1) selama `ms`, lalu done().
   Selalu dihitung dari volume SAAT INI → arah bisa dibalik mulus kapan pun. */
  const fadeTo = useCallback((target, ms, done) => {
    const a = audioRef.current;
    stopFade();
    if (!a) { done && done(); return; }
    const goal = Math.max(0, Math.min(1, target * SOUND_MAX_VOLUME));
    if (ms <= 0 || Math.abs(a.volume - goal) < 0.005) {
      a.volume = goal;
      done && done();
      return;
    }
    const from = a.volume;
    const t0 = performance.now();
    fadeRef.current = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (goal - from) * k;
      if (k >= 1) { a.volume = goal; stopFade(); done && done(); }
    }, 50);
  }, [stopFade]);

  /* Nyalakan / matikan — dengan fade */
  useEffect(() => {
    if (on) {
      let a = audioRef.current;
      if (!a) {
        a = new Audio();
        a.loop = true;
        a.preload = 'auto';
        a.volume = 0;
        audioRef.current = a;
      }
      const src = stateRef.current.dusk ? SRC_DUSK : SRC_DAY;
      if (!a.src.endsWith(src)) a.src = src;
      const p = a.play();
      if (p && p.catch) p.catch(() => { a.volume = 0; }); /* autoplay diblokir → siapkan fade dari nol saat toggle berikutnya */
      fadeTo(stateRef.current.vol, FADE_MS);
    } else {
      const a = audioRef.current;
      if (!a || a.paused) return;
      fadeTo(0, FADE_MS, () => { if (!stateRef.current.on) a.pause(); });
    }
    return stopFade;
  }, [on, fadeTo, stopFade]);

  /* Slider: penyesuaian cepat tapi tetap halus saat musik menyala
   (skip run pertama supaya fade-in awal tetap pakai durasi FADE_MS penuh) */
  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (!stateRef.current.on || !audioRef.current) return;
    fadeTo(vol, 200);
  }, [vol, fadeTo]);

  /* Ganti track siang ↔ senja: fade out → ganti file → fade in */
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const src = dusk ? SRC_DUSK : SRC_DAY;
    if (a.src.endsWith(src)) return;
    if (!stateRef.current.on) { a.src = src; return; }
    const half = Math.round(FADE_MS / 2);
    fadeTo(0, half, () => {
      if (!stateRef.current.on) return; /* kebetulan dimatikan di tengah crossfade */
      a.src = src;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
      fadeTo(stateRef.current.vol, half);
    });
  }, [dusk, fadeTo]);

  /* Unmount: berhenti total — jangan biarkan musik terus mengalir diam-diam */
  useEffect(() => () => {
    stopFade();
    if (audioRef.current) audioRef.current.pause();
  }, [stopFade]);

  const toggle = useCallback(() => setOn((v) => !v), []);
  return { on, vol, toggle, setVol };
}