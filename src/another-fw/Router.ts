import * as express from 'express';
import { Server } from '../better-fw/Server';
import { RouteClass } from './Route';
import { Loggable, ClassType } from '../better-fw/types';
import { Logger } from '../better-fw/Logger';

export abstract class Router extends Loggable {
  public route: string = '/';
  public router: express.Router;
  public server: Server;
  public middleware: express.RequestHandler[] = [];

  get logData() {
    return {
      route: this.route,
    };
  }

  constructor(server: Server) {
    super();
    this.server = server;
    this.router = express.Router();
  }

  protected abstract routes(): void;

  private registerMiddleware() {
    this.router.use(this.addRouterToRequestMiddleware);

    for (const middleware of this.middleware) {
      this.router.use(middleware);
    }
  }

  private addRouterToRequestMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    // @ts-ignore
    req.routerClass = this;
    next();
  }

  protected registerRoute<R extends RouteClass>(route: R) {
    route.register(this);
  }

  protected loggerFactory() {
    return this.server.logger.child({ router: this.route }) as Logger;
  }

  static init<R extends Router>(this: ClassType<R>, ...args: any[]) {
    const inst = new this(...args);
    inst.initLogger();
    inst.registerMiddleware();

    inst.routes();
    return inst;
  }
}
