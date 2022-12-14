import { config } from '@root/config';
import { ChattyServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import express, { Express } from 'express';

//this Application is not the same from setupServer
class Application {
  public initialize(): void {
    this.loadConfig();
    databaseConnection();
    const app: Express = express(); // creating an instanse of express
    const server: ChattyServer = new ChattyServer(app); //instanse of the server--when you use the keyword "new" you are calling the constructor
    server.start(); //this start is from the class ChattyServer public method
  }
  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();
  }
}

const application: Application = new Application(); //we are not passing anything because there is no constructor
application.initialize();
