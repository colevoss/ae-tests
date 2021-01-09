import * as express from 'express';
import { Route } from './Route';
import { Server } from './Server';
import { Logger } from './Logger';
import {
  ClassType,
  InitClassType,
  Loggable,
  Response,
  Request,
  NextFunction,
} from './types';

export class Router<S extends Server = Server> extends Loggable {
  public route: string = '/';
  public router: express.Router;
  public server: S;
  public logger: Logger;

  public routes: InitClassType<Route>[];

  constructor(server: S) {
    super();

    this.server = server;
    this.router = express.Router();
  }

  private addRouterToRequestMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // @ts-ignore
    req.routerClass = this;
    next();
  }

  private addRouteToRequestMiddleware<R extends Route>(route: R) {
    return (req: Request, res: Response, next: NextFunction) => {
      // @ts-ignore
      req.routeClass = route;
      next();
    };
  }

  private registerMiddleware() {
    this.router.use(this.addRouterToRequestMiddleware.bind(this));
  }

  protected loggerFactory() {
    return this.server.logger.child({ router: this.route }) as Logger;
  }

  private registerRoutes() {
    for (const routeType of this.routes) {
      const route = routeType.init(this);
      this.router[route.type](
        route.route,
        this.addRouteToRequestMiddleware(route),
        route.requestHandler.bind(route),
      );
    }
  }

  static init<R extends Router>(this: ClassType<R>, ...args: any[]) {
    const inst = new this(...args);
    inst.initLogger();
    inst.registerMiddleware();

    inst.registerRoutes();
    return inst;
  }
}
