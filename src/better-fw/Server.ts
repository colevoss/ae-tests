import * as express from 'express';
import {
  ClassType,
  InitClassType,
  Loggable,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from './types';
import { Router } from './Router';
import { Logger, createLogger } from './Logger';
import { HttpError, HttpErrors } from './Errors';
import * as helmet from 'helmet';
import * as cors from 'cors';
import * as compression from 'compression';
import { Subscriber, brokerRepository, Broker } from './broker';

/**
 * Wrapper around an HTTP server. Registers routers on an Express server to expose
 * their endpoints. Also registers event handlers to an environment specific Event
 * Broker.
 */
export class Server extends Loggable {
  public app: express.Express;
  // public routers: InitClassType<R>[];
  public broker: Broker;
  public subscribers: any[];
  public routers: any[];
  public port?: number;
  public logger: Logger;
  public middleware: RequestHandler[] = [];

  constructor() {
    super();
    this.app = express();
  }

  /**
   * Hook function to be called prior to the express server starting.
   */
  protected beforeStart() {}

  /**
   * Hook function to be called after the express server starts
   */
  protected afterStart() {}

  private registerInternalMiddleware() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(compression());
    this.app.use(this.addServerToRequestMiddleware.bind(this));
  }

  /**
   * Create Event broker and register subscribers
   */
  private async initEventBroker<S extends InitClassType<Subscriber>>() {
    this.broker = brokerRepository(this);

    if (this.subscribers && this.subscribers.length) {
      for (const subscriber of this.subscribers as S[]) {
        this.broker.subscribe(subscriber);
      }
    }
  }

  /**
   * Adds the instance of the server class on a request object. This is to enable
   * more contextual logging from places that don't have a context scoped logger
   * attached, namely the global error handling middleware.
   */
  private addServerToRequestMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // @ts-ignore
    req.serverClass = this;
    next();
  }

  /**
   * An error handling middle ware, to be registered last in the middleware chain,
   * that properly handles responding to requests with appropriate status codes
   * and logging the error
   *
   * @see https://expressjs.com/en/guide/error-handling.html
   */
  private errorHandlerMiddleware<E extends Error>(
    err: E,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    // @ts-ignore
    const loggable = req.routeClass || req.routerClass || req.serverClass;
    const logger = loggable.logger;

    if (err instanceof HttpError) {
      res.status(err.status);
      res.json(err.toJson());
      logger.warn({ err, ...err.toJson() });

      return;
    } else {
      const internalError = new HttpErrors.InternalServerError('Internal');
      res.status(internalError.status);
      res.json(internalError.toJson());
      logger.error(err);
    }
  }

  /**
   * Registers all middleware provided by the extending class at the app level
   */
  private registerMiddleware() {
    this.registerInternalMiddleware();

    for (const mid of this.middleware) {
      this.app.use(mid);
    }
  }

  /**
   * If port is set on the extending class, use that. Otherwise use the PORT env
   * variable. If none of those are set, use 8080
   */
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

  /**
   * Starts the service's Express server
   */
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

  /**
   * Creates a new instance of a Server class.
   */
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
