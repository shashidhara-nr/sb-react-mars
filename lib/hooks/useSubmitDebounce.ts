import { useCallback, useRef, useEffect, useState } from 'react';

export const useSubmitDebounce = (delay: number = 1000) => {
  const [isDebounced, setIsDebounced] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debounce = useCallback(() => {
    if (isDebounced) return true;

    setIsDebounced(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setIsDebounced(false), delay);
    return false;
  }, [isDebounced, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return debounce;
};
