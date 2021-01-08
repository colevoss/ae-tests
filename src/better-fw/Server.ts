import * as express from 'express';
import { ClassType, InitClassType, Loggable } from './types';
import { Router } from './Router';
import { Logger, createLogger } from './Logger';
import { HttpError, HttpErrors } from './Errors';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as compression from 'compression';
import { Subscriber, brokerRepository, Broker } from '../broker';

export class Server extends Loggable {
  public app: express.Express;
  // public routers: InitClassType<R>[];
  public broker: Broker;
  public subscribers: any[];
  public routers: any[];
  public port?: number;
  public logger: Logger;
  public middleware: express.RequestHandler[] = [];

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
    this.app.use(compression());
    this.app.use(this.addServerToRequestMiddleware.bind(this));
  }

  private async initEventBroker<S extends InitClassType<Subscriber>>() {
    this.broker = brokerRepository(this);

    if (this.subscribers && this.subscribers.length) {
      for (const subscriber of this.subscribers as S[]) {
        this.broker.subscribe(subscriber);
      }
    }
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

    for (const mid of this.middleware) {
      this.app.use(mid);
    }
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

    await this.broker.start();

    const port = this.appPort();

    this.app.listen(port, () => {
      this.logger.info({ port }, 'Application started and listening on port');
      this.afterStart();
    });
  }

  static new<S extends Server>(this: ClassType<S>, ...args: any[]) {
    const inst = new this(...args);
    inst.initLogger();

    inst.initEventBroker();
    inst.registerMiddleware();
    inst.registerRouters();

    inst.app.use(inst.errorHandlerMiddleware.bind(inst));
    return inst;
  }
}
