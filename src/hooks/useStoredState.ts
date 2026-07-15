import { useEffect, useRef, useState } from 'react';
import { getStorage, setStorage } from '../services/chrome';

export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const loaded = useRef(false);

  useEffect(() => {
    getStorage(key).then((data) => {
      if (data[key] !== undefined) setValue(data[key] as T);
      loaded.current = true;
    });
  }, [key]);

  useEffect(() => {
    if (loaded.current) void setStorage({ [key]: value });
  }, [key, value]);

  return [value, setValue] as const;
}
