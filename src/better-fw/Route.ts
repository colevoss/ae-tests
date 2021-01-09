import { Loggable, Method, NextFunction } from './types';
import { Router } from './Router';
import { ClassType, Request, Response } from './types';
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
    context: Context,
    req: Request,
    resp: Response,
  ): PromiseLike<any>;

  static init<R extends Route>(this: ClassType<R>, ...args: any[]) {
    const inst = new this(...args);

    inst.initLogger();

    return inst;
  }

  public async requestHandler(
    req: Request,
    resp: Response,
    next: NextFunction,
  ) {
    const context = new Context(this, req, resp);
    try {
      await this.handler(context, req, resp);
    } catch (err) {
      next(err);
    }
  }
}
