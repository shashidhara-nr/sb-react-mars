import { useCallback, useEffect, useRef, useState } from 'react';

interface UseIdleMonitorConfig {
  sessionTimeout?: number;
  warningThreshold?: number;
  onIdle?: () => void;
  onActive?: () => void;
}

interface UseIdleMonitorResult {
  isIdle: boolean;
  timeUntilWarning: number;
  timeUntilLogout: number;
  resetIdle: () => void;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const useIdleMonitor = ({
  sessionTimeout = 12 * 60 * 1000,
  warningThreshold = 2 * 60 * 1000,
  onIdle,
  onActive,
}: UseIdleMonitorConfig = {}): UseIdleMonitorResult => {
  const [isIdle, setIsIdle] = useState(false);
  const [timeUntilWarning, setTimeUntilWarning] = useState(sessionTimeout - warningThreshold);
  const [timeUntilLogout, setTimeUntilLogout] = useState(sessionTimeout);
  
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMonitoringRef = useRef(false);
  const lastActivityTimeRef = useRef<number>(Date.now());
  
  // Store state in refs to avoid stale closures
  const isIdleRef = useRef(false);
  const configRef = useRef({ sessionTimeout, warningThreshold, onIdle, onActive });
  
  // Keep configRef up to date
  useEffect(() => {
    configRef.current = { sessionTimeout, warningThreshold, onIdle, onActive };
  }, [sessionTimeout, warningThreshold, onIdle, onActive]);

  const handleUserActivity = useCallback(() => {
    lastActivityTimeRef.current = Date.now();

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    if (isIdleRef.current) {
      isIdleRef.current = false;
      setIsIdle(false);
      if (configRef.current.onActive) {
        configRef.current.onActive();
      }
    }

    const { sessionTimeout: timeout, warningThreshold: warning, onIdle: onIdleCb } = configRef.current;
    const timeUntilWarned = timeout - warning;
    idleTimerRef.current = setTimeout(() => {
      isIdleRef.current = true;
      setIsIdle(true);
      if (onIdleCb) {
        onIdleCb();
      }
    }, timeUntilWarned);
  }, []);

  const startCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    countdownTimerRef.current = setInterval(() => {
      const { sessionTimeout: timeout, warningThreshold: warning } = configRef.current;
      const timeSinceLastActivity = Date.now() - lastActivityTimeRef.current;
      const timeRemaining = Math.max(0, timeout - timeSinceLastActivity);
      const timeBeforeWarning = Math.max(0, timeout - warning - timeSinceLastActivity);

      setTimeUntilLogout(timeRemaining);
      setTimeUntilWarning(timeBeforeWarning);

      if (timeRemaining <= 0) {
        clearInterval(countdownTimerRef.current!);
      }
    }, 100);
  }, []);

  const startMonitoring = useCallback(() => {
    if (isMonitoringRef.current) {
      return;
    }

    isMonitoringRef.current = true;
    lastActivityTimeRef.current = Date.now();

    const events = ['mousemove', 'keydown', 'mousewheel', 'DOMMouseScroll', 'click', 'scroll'];

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    handleUserActivity();
    startCountdown();
  }, [handleUserActivity, startCountdown]);

  const stopMonitoring = useCallback(() => {
    if (!isMonitoringRef.current) return;

    isMonitoringRef.current = false;

    const events = ['mousemove', 'keydown', 'mousewheel', 'DOMMouseScroll', 'click', 'scroll'];

    events.forEach(event => {
      document.removeEventListener(event, handleUserActivity, true);
    });

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  }, [handleUserActivity]);

  const resetIdle = useCallback(() => {
    setIsIdle(false);
    isIdleRef.current = false;
    handleUserActivity();
  }, [handleUserActivity]);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    isIdle,
    timeUntilWarning,
    timeUntilLogout,
    resetIdle,
    startMonitoring,
    stopMonitoring,
  };
};

export default useIdleMonitor;
