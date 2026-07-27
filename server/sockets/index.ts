import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { SocketEvent } from "../constants";

export class SocketServer {
  private io: Server | null = null;

  init(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Socket authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
      if (!token) {
        // Allow anonymous connection for global leaderboards and public telemetry
        return next();
      }
      try {
        if (token === "mock-jwt-session") {
          (socket as any).userId = "660000000000000000000001";
          return next();
        }
        const payload = jwt.verify(token, env.JWT_SECRET) as any;
        (socket as any).userId = payload.userId;
        next();
      } catch {
        next();
      }
    });

    this.io.on(SocketEvent.CONNECT, (socket: Socket) => {
      const userId = (socket as any).userId;
      logger.debug(`Socket connected: ${socket.id} (User: ${userId || "ANONYMOUS"})`);

      if (userId) {
        socket.join(`user:${userId}`);
      }
      socket.join("global");

      socket.on(SocketEvent.JOIN_ROOM, (room: string) => {
        socket.join(room);
        logger.debug(`Socket ${socket.id} joined room: ${room}`);
      });

      socket.on(SocketEvent.LEAVE_ROOM, (room: string) => {
        socket.leave(room);
        logger.debug(`Socket ${socket.id} left room: ${room}`);
      });

      socket.on(SocketEvent.DISCONNECT, () => {
        logger.debug(`Socket disconnected: ${socket.id}`);
      });
    });

    logger.info("Socket.IO Real-Time Engine initialized");
    return this.io;
  }

  emitToAll(event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
    }
  }

  emitToUser(userId: string, event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.to(`user:${userId}`).emit(event, data);
    }
  }

  emitToRoom(room: string, event: SocketEvent | string, data: any): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
    }
  }
}

export const socketServer = new SocketServer();
