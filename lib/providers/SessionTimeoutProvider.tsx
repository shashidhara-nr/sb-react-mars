import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIdleMonitor } from '../hooks/useIdleMonitor';
import { SessionTimeoutDialog } from 'components/atoms/SessionTimeoutDialog/SessionTimeoutDialog';

interface SessionTimeoutContextType {
  isIdle: boolean;
  timeUntilWarning: number;
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  resetIdle: () => void;
}

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
  sessionTimeoutMs?: number;
  warningThresholdMs?: number;
  warningDurationMs?: number;
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({
  children,
  sessionTimeoutMs = 12 * 60 * 1000,
  warningThresholdMs = 2 * 60 * 1000,
  warningDurationMs = 30 * 1000,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const idleMonitor = useIdleMonitor({
    sessionTimeout: sessionTimeoutMs,
    warningThreshold: warningThresholdMs,
    onIdle: () => {
      setShowDialog(true);
    },
    onActive: () => {
    },
  });

  const handleStartMonitoring = () => {
    idleMonitor.startMonitoring();
    setIsMonitoring(true);
  };

  const handleStopMonitoring = () => {
    idleMonitor.stopMonitoring();
    setIsMonitoring(false);
    setShowDialog(false);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    idleMonitor.resetIdle();
  };

  // Auto-start monitoring on mount if we're in browser
  useEffect(() => {
    handleStartMonitoring();

    return () => handleStopMonitoring();
  }, []);

  const value: SessionTimeoutContextType = {
    isIdle: idleMonitor.isIdle,
    timeUntilWarning: idleMonitor.timeUntilWarning,
    isMonitoring,
    startMonitoring: handleStartMonitoring,
    stopMonitoring: handleStopMonitoring,
    resetIdle: idleMonitor.resetIdle,
  };

  return (
    <SessionTimeoutContext.Provider value={value}>
      {children}
      <SessionTimeoutDialog
        open={showDialog}
        warningTimeoutMs={warningDurationMs}
        onDialogClose={handleDialogClose}
      />
    </SessionTimeoutContext.Provider>
  );
};

/**
 * Hook to use SessionTimeout context
 */
export const useSessionTimeoutContext = (): SessionTimeoutContextType => {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error('useSessionTimeoutContext must be used within SessionTimeoutProvider');
  }
  return context;
};

export default SessionTimeoutProvider;
