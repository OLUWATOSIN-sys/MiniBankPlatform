import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('WebsocketGateway');
  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Remove user from tracking
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(client: Socket, userId: string) {
    this.logger.log(`User ${userId} joined room`);
    this.userSockets.set(userId, client.id);
    client.join(`user-${userId}`);
  }

  // Send balance update to specific user
  sendBalanceUpdate(userId: string, accounts: any[]) {
    this.server.to(`user-${userId}`).emit('balance-updated', {
      accounts,
      timestamp: new Date().toISOString(),
    });
  }

  // Send transaction notification to user
  sendTransactionNotification(userId: string, transaction: any) {
    this.server.to(`user-${userId}`).emit('transaction-notification', {
      transaction,
      timestamp: new Date().toISOString(),
    });
  }

  // Send notification to multiple users (for transfers)
  sendTransferNotification(fromUserId: string, toUserId: string, transaction: any) {
    // Notify sender
    this.server.to(`user-${fromUserId}`).emit('transaction-notification', {
      transaction: { ...transaction, type: 'sent' },
      timestamp: new Date().toISOString(),
    });

    // Notify recipient
    this.server.to(`user-${toUserId}`).emit('transaction-notification', {
      transaction: { ...transaction, type: 'received' },
      timestamp: new Date().toISOString(),
    });
  }
}
