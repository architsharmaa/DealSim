import { Server as SocketIOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';

class SocketService {
  private io: SocketIOServer | null = null;

  init(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // In production, restrict this to your frontend URL
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[Socket] New connection: ${socket.id}`);

      socket.on('subscribe', (sessionId: string) => {
        console.log(`[Socket] Client ${socket.id} subscribed to session: ${sessionId}`);
        socket.join(`session:${sessionId}`);
      });

      socket.on('unsubscribe', (sessionId: string) => {
        console.log(`[Socket] Client ${socket.id} unsubscribed from session: ${sessionId}`);
        socket.leave(`session:${sessionId}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket] Connection closed: ${socket.id}`);
      });
    });

    console.log('[Socket] Internal Socket.io server initialized');
  }

  emitToSession(sessionId: string, event: string, data: any) {
    if (!this.io) {
      console.warn('[Socket] Attempted to emit before initialization');
      return;
    }
    this.io.to(`session:${sessionId}`).emit(event, data);
  }
}

export const socketService = new SocketService();
