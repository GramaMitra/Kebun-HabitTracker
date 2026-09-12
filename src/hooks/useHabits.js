import { useState, useEffect, useCallback } from 'react';
import { dayKey } from '../lib/garden.js';

const LS_KEY = 'kebun.v1';

export function useHabits() {
  const [habits, setHabits] = useState(null);

  useEffect(() => {
    let data = [];
    try { const raw = localStorage.getItem(LS_KEY); if (raw) data = JSON.parse(raw) || []; } catch (e) {}
    const t = setTimeout(() => setHabits(data), 320);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!habits) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(habits)); } catch (e) {}
  }, [habits]);

  const addHabit = useCallback((name, species, frequency) => {
    const id = 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    setHabits((prev) => [...prev, { id, name, species, frequency, createdAt: Date.now(), waterLog: {} }]);
    return id;
  }, []);

  const updateHabit = useCallback((id, patch) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h))), []);

  const removeHabit = useCallback((id) =>
    setHabits((prev) => prev.filter((h) => h.id !== id)), []);

  /* k = hari yang mau ditandai (default: hari ini nyata). Dev mode bisa
     mengirim hari simulasi supaya state & UI tetap konsisten. */
  const water = useCallback((id, k = dayKey()) => setHabits((prev) => prev.map((h) => {
    if (h.id !== id) return h;
    return { ...h, waterLog: { ...h.waterLog, [k]: { watered: true, at: Date.now(), note: null } } };
  })), []);

  /* Undo siraman: hapus tanda hari tsb (catatannya juga ikut terhapus). */
  const unwater = useCallback((id, k = dayKey()) => setHabits((prev) => prev.map((h) => {
    if (h.id !== id) return h;
    const log = { ...h.waterLog }; delete log[k];
    return { ...h, waterLog: log };
  })), []);

  const setNote = useCallback((id, k, note) => setHabits((prev) => prev.map((h) => {
    if (h.id !== id) return h;
    const e = h.waterLog[k] || { watered: false };
    return { ...h, waterLog: { ...h.waterLog, [k]: { ...e, note } } };
  })), []);

  const clearAll = useCallback(() => setHabits([]), []);

  return { habits, addHabit, updateHabit, removeHabit, water, unwater, setNote, clearAll };
}