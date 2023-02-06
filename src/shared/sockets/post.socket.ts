import { ICommentDocument } from '@comments/interfaces/comment.interface';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { Server, Socket } from 'socket.io';

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }
  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reactions', (reaction: IReactionDocument) => {
        this.io.emit('update like', reaction); //every user that is connected will be able to listen these updates
      });
      socket.on('comment', (data: ICommentDocument) => {
        this.io.emit('update comment', data); //every user that is connected will be able to listen these updates
      });
    });
  }
}
