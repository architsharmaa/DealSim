import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface AnalyticsUpdate {
  wpm: number;
  talkRatio: number;
  fillerWordCount: Record<string, number>;
  sentiment: string;
  monologueFlag: boolean;
}

export const useSessionSocket = (sessionId: string | undefined) => {
  const [liveAnalytics, setLiveAnalytics] = useState<AnalyticsUpdate | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Initialize socket connection
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to server');
      setIsSocketConnected(true);
      // Subscribe to session updates
      socket.emit('subscribe', sessionId);
    });

    socket.on('analytics_update', (data: AnalyticsUpdate) => {
      console.log('[Socket] Analytics update received:', data);
      setLiveAnalytics(data);
    });

    socket.on('session_ended', (data: { evaluationId: string }) => {
      console.log('[Socket] Session ended:', data);
      // Trigger any end-of-session UI logic here if needed
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from server');
      setIsSocketConnected(false);
    });

    return () => {
      socket.emit('unsubscribe', sessionId);
      socket.disconnect();
    };
  }, [sessionId]);

  return { liveAnalytics, isSocketConnected };
};
