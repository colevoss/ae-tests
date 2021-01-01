import { Logger } from './Logger';

export enum Method {
  Get = 'get',
  Post = 'post',
  Put = 'put',
}

// export type ClassType<T> = new (...args: any[]) => T;
export type ClassType<T> = {
  new (...args: any[]): T;
};

export type InitClassType<T> = {
  init(...args: any[]): T;
};

export abstract class Loggable {
  public logger: Logger;

  protected initLogger() {
    this.logger = this.loggerFactory();
  }

  protected abstract loggerFactory(): Logger;
}
