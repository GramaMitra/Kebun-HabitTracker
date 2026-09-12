import { useState, useEffect } from 'react';

const KEY = 'kebun.name';

export function useGardenName() {
  const [name, setName] = useState(() => {
    try { return localStorage.getItem(KEY) || 'Kebun'; } catch (e) { return 'Kebun'; }
  });
  useEffect(() => { try { localStorage.setItem(KEY, name); } catch (e) {} }, [name]);
  return [name, setName];
}