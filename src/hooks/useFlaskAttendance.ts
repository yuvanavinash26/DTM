import { useState, useEffect, useCallback } from 'react';
import {
  FlaskConnectionState,
  FlaskAttendanceResponse,
} from '../types/attendance';
import {
  fetchAttendanceStatus,
  getFlaskConnectionState,
} from '../services/flaskAttendanceService';

export function useFlaskAttendance(intervalMs: number = 2000) {
  const [state, setState] = useState<FlaskConnectionState>(getFlaskConnectionState());
  const [isRetrying, setIsRetrying] = useState(false);

  const poll = useCallback(async () => {
    try {
      await fetchAttendanceStatus();
    } catch {
      // Handled within service
    }
  }, []);

  useEffect(() => {
    // Initial immediate fetch on mount
    poll();

    // Auto-fetch every 2 seconds as required by specification
    const timer = setInterval(() => {
      poll();
    }, intervalMs);

    const handleStateUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<FlaskConnectionState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      } else {
        setState(getFlaskConnectionState());
      }
    };

    window.addEventListener('dtm_flask_status', handleStateUpdate);

    // Clean up on unmount to prevent memory leaks
    return () => {
      clearInterval(timer);
      window.removeEventListener('dtm_flask_status', handleStateUpdate);
    };
  }, [poll, intervalMs]);

  const triggerRetry = async () => {
    setIsRetrying(true);
    try {
      await fetchAttendanceStatus();
    } catch {
      // handled
    } finally {
      setIsRetrying(false);
    }
  };

  return {
    ...state,
    isConnected: state.status === 'CONNECTED',
    isOffline: state.status === 'OFFLINE',
    triggerRetry,
    isRetrying,
  };
}
