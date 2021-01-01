import * as express from 'express';
import * as pino from 'pino';
import { Loggable, Method } from './types';
import { Router } from './Router';
import { ClassType } from './types';

export abstract class Route<R extends Router = Router> extends Loggable {
  public route: string = '';
  public type: Method;
  public logger: pino.Logger;

  protected router: R;
  protected server: R['server'];

  constructor(router: R) {
    super();

    this.router = router;
    this.server = router.server;
  }

  protected loggerFactory() {
    return this.router.logger.child({ route: this.route, type: this.type });
  }

  abstract handler(
    req: express.Request,
    resp: express.Response,
    next?: express.NextFunction,
  ): PromiseLike<any>;

  static init<R extends Route>(this: ClassType<R>, ...args: any[]) {
    const inst = new this(...args);

    inst.initLogger();

    return inst;
  }

  public async requestHandler(
    req: express.Request,
    resp: express.Response,
    next: express.NextFunction,
  ) {
    try {
      await this.handler(req, resp, next);
    } catch (err) {
      next(err);
    }
  }
}
