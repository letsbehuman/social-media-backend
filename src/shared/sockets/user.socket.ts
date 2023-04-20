import { ISocketData } from '@user/interfaces/user.interface';
import { Server, Socket } from 'socket.io';

export let socketIOUserObject: Server;

export class SocketIOUserHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOUserObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('block user', (data: ISocketData) => {
        // this come from the front end
        this.io.emit('blocked user id', data); //and we send this back to the front end
      });

      socket.on('unblock user', (data: ISocketData) => {
        this.io.emit('unblocked user id', data); //every user that is connected will be able to listen these updates
      });
    });
  }
}
