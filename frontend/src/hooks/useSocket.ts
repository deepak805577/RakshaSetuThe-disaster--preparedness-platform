import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface DrillSessionEvent {
  sessionId: string;
  scenario: any;
  dbSessionId: string;
  startTime: Date;
}

interface ParticipantJoinedEvent {
  sessionId: string;
  participant: {
    id: string;
    name: string;
    role: string;
  };
  participantCount: number;
}

interface ParticipantStatusUpdatedEvent {
  sessionId: string;
  participantId: string;
  status: string;
  participant: any;
}

interface NewDrillSessionEvent {
  sessionId: string;
  scenario: string;
  host: string;
  participants: number;
  maxParticipants: number;
  status: string;
}

export interface SocketEvents {
  // Drill session events
  'drill-session-started': (data: DrillSessionEvent) => void;
  'participant-joined': (data: ParticipantJoinedEvent) => void;
  'participant-status-updated': (data: ParticipantStatusUpdatedEvent) => void;
  'new-drill-session': (data: NewDrillSessionEvent) => void;
  
  // Legacy drill events
  'drill-joined': (data: any) => void;
  'step-completed': (data: any) => void;
  'drill-completed': (data: any) => void;
  'progress-update': (data: any) => void;
  
  // Emergency alerts
  'emergency-alert': (data: any) => void;
  
  // Leaderboard updates
  'leaderboard-updated': (data: any) => void;
}

export interface SocketEmitEvents {
  // Join rooms
  'join-drill': (data: { userId: string; drillType: string }) => void;
  'join-alerts': (data: { district: string }) => void;
  'join-leaderboard': (data: { school?: string; grade?: number }) => void;
  
  // Drill actions
  'step-completed': (data: { userId: string; stepNumber: number; completionTime: number }) => void;
  'drill-completed': (data: { userId: string; totalTime: number; score: number }) => void;
  'drill-progress': (data: { userId: string; currentStep: number; progress: number }) => void;
  
  // Admin actions
  'broadcast-alert': (data: { districts: string[]; alert: any }) => void;
  'leaderboard-update': (data: { school?: string; leaderboardData: any }) => void;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const { user } = useAuth();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!user) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 
                     (process.env.NODE_ENV === 'production' 
                       ? 'https://your-backend-url.com' 
                       : 'http://localhost:5000');

    console.log('🔌 Connecting to socket server:', socketUrl);

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      timeout: 5000,
      forceNew: true,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      
      // Attempt reconnection for certain disconnect reasons
      if (reason === 'io server disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts.current++;
          console.log(`🔄 Reconnection attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          newSocket.connect();
        }, 1000 * reconnectAttempts.current);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('🚫 Socket error:', error);
      setConnectionError(`Socket error: ${error.message || error}`);
    });

    setSocket(newSocket);

    // Auto-join user-specific rooms
    if (user._id) {
      // Join personal drill room
      newSocket.emit('join-drill', { 
        userId: user._id, 
        drillType: 'general' 
      });

      // Join district alerts if user has district info
      if (user.profile?.district) {
        newSocket.emit('join-alerts', { 
          district: user.profile.district 
        });
      }

      // Join leaderboard room
      newSocket.emit('join-leaderboard', { 
        school: user.school, 
        grade: user.grade 
      });
    }

    return () => {
      console.log('🔌 Disconnecting socket...');
      newSocket.disconnect();
    };
  }, [user]);

  // Event listener function (to be used inside useEffect in components)
  const on = (event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, handler);
    }
  };
  
  const off = (event: string, handler: (...args: any[]) => void) => {
    if (socket) {
      socket.off(event, handler);
    }
  };

  // Enhanced event emitter
  const emit = <K extends keyof SocketEmitEvents>(
    event: K, 
    data: Parameters<SocketEmitEvents[K]>[0]
  ) => {
    if (socket && isConnected) {
      socket.emit(event as string, data);
      console.log(`📤 Emitted ${event}:`, data);
    } else {
      console.warn(`⚠️ Cannot emit ${event}: Socket not connected`);
    }
  };

  // Join specific session room
  const joinSessionRoom = (sessionId: string) => {
    if (socket && isConnected) {
      socket.emit('join-room', { roomId: `drill-session-${sessionId}` });
      console.log(`🏠 Joined session room: drill-session-${sessionId}`);
    }
  };

  // Leave specific session room
  const leaveSessionRoom = (sessionId: string) => {
    if (socket && isConnected) {
      socket.emit('leave-room', { roomId: `drill-session-${sessionId}` });
      console.log(`🚪 Left session room: drill-session-${sessionId}`);
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    on,
    off,
    emit,
    joinSessionRoom,
    leaveSessionRoom,
    // Direct access to socket for complex operations
    raw: socket
  };
};

export default useSocket;
