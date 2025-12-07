import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // Map<userId, socketId[]> if a user has multiple tabs open
  private connectedUsers: Map<number, Set<string>> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.auth.headers;
      if (!authHeader) {
        client.disconnect();
        return;
      }

      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.decode(token) as any;
      if (!payload || !payload.id) {
        client.disconnect();
        return;
      }

      const userId = payload.id;

      // Add user to the map
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, new Set());
      }
      this.connectedUsers.get(userId).add(client.id);

      // Attach userId to socket for easy lookup on disconnect
      client.data.userId = userId;

      await client.join(`user-${userId}`);
      this.logger.log(`User ${userId} connected`);
    } catch (error) {
      this.logger.error('Connection error', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // Get userId from Instance of Socket
    const userId = client.data.userId;
    if (userId && this.connectedUsers.has(userId)) {
      // Only delete the tab that disconnected
      const userSockets = this.connectedUsers.get(userId);
      // Remove the current socket
      userSockets.delete(client.id);

      // Remove record if user has no more tabs open
      if (userSockets.size === 0) {
        this.connectedUsers.delete(userId);
      }
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  sendNotification(userId: number, payload: any) {
    if (this.connectedUsers.has(userId)) {
      this.server.to(`user-${userId}`).emit('notification', payload);
      this.logger.log(`Sent notification to user ${userId}`);
    } else {
      // User is offline, do nothing (notification is already in DB)
      this.logger.log(`User ${userId} is offline, skipping WebSocket`);
    }
  }
}
