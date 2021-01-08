import * as express from 'express';
import * as pino from 'pino';
import { Loggable, Method } from './types';
import { Router } from './Router';
import { ClassType } from './types';
import { Context } from './Context';
import { Logger } from './Logger';

export abstract class Route<R extends Router = Router> extends Loggable {
  public route: string = '';
  public type: Method;
  public logger: Logger;

  protected router: R;
  public server: R['server'];

  constructor(router: R) {
    super();

    this.router = router;
    this.server = router.server;
  }

  protected loggerFactory() {
    return this.router.logger.child({
      route: this.route,
      type: this.type,
    }) as Logger;
  }

  abstract handler(
    req: express.Request,
    resp: express.Response,
    context: Context,
  ): // next?: express.NextFunction,
  PromiseLike<any>;

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
    const context = new Context(this, req, resp);
    try {
      // await this.handler(req, resp, next);
      await this.handler(req, resp, context);
    } catch (err) {
      next(err);
    }
  }
}
