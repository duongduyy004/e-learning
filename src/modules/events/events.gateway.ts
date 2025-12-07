import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { AllConfigType } from "config/config.type";
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;
    constructor(
        private configService: ConfigService<AllConfigType>
    ) { }

    afterInit(server: Socket) {
        console.log('Client init', server.client)
    }

    handleConnection(client: Socket, ...args: any[]) {
        const userId = client.handshake.query.userId;

        if (userId) {
            client.join(`user_${userId}`)
        }
        console.log(userId)
        if (userId === '1')
            this.server.to(`user_${userId}`).emit('data', `this is a private message of ${userId}`);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected ' + client.id);
    }

    sendToUser(userId: number, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
}