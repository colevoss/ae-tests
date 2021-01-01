import * as express from 'express';
import { ClassType, InitClassType, Loggable } from './types';
import { Router } from './Router';
import { Logger, createLogger } from './Logger';
import { HttpError, HttpErrors } from './Errors';
import * as helmet from 'helmet';
import * as cors from 'cors';

export class Server extends Loggable {
  public app: express.Express;
  // public routers: InitClassType<R>[];
  public routers: any[];
  public port?: number;
  public logger: Logger;

  constructor() {
    super();
    this.app = express();
  }

  protected beforeStart() {}
  protected afterStart() {}

  private registerInternalMiddleware() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(this.addServerToRequestMiddleware.bind(this));
  }

  private addServerToRequestMiddleware(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    // @ts-ignore
    req.serverClass = this;
    next();
  }

  private errorHandlerMiddleware<E extends Error>(
    err: E,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    // @ts-ignore
    const loggable = req.routeClass || req.routerClass || req.serverClass;
    const logger = loggable.logger;

    if (err instanceof HttpError) {
      res.status(err.status);
      res.json(err.toJson());
      logger.warn({ err, ...err.toJson() });
    } else {
      const internalError = new HttpErrors.InternalServerError('Internal');
      res.status(internalError.status);
      res.json(internalError.toJson());
      logger.error(err);
    }
  }

  private registerMiddleware() {
    this.registerInternalMiddleware();
  }

  private appPort() {
    if (this.port) {
      return this.port;
    }

    const envPort = process.env.PORT;

    if (envPort) return envPort;

    return 8080;
  }

  private registerRouters<R extends Router>() {
    for (const routerType of this.routers as InitClassType<R>[]) {
      const router = routerType.init(this);

      this.app.use(router.route, router.router);
    }
  }

  protected loggerFactory() {
    return createLogger();
  }

  public async start() {
    try {
      await this.beforeStart();
    } catch (err) {
      this.logger.error({ err }, 'Error occurred during beforeStart hook');
    }

    const port = this.appPort();

    this.app.listen(port, () => {
      this.logger.info({ port }, 'Application started and listening on port');
      this.afterStart();
    });
  }

  static new<S extends Server>(this: ClassType<S>, ...args: any[]) {
    const inst = new this(...args);
    inst.initLogger();

    inst.registerMiddleware();
    inst.registerRouters();

    inst.app.use(inst.errorHandlerMiddleware.bind(inst));
    return inst;
  }
}
