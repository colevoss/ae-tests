import * as express from 'express';
import { Method, InitClassType, ClassType } from '../better-fw/types';
import { Server } from '../better-fw/Server';
import { Logger, createLogger } from '../better-fw/Logger';
export { Method } from '../better-fw/types';
import { Router } from './Router';

export type RouteClass = ClassType<Route> & {
  route: string;
  type: Method;
  middleware: express.RequestHandler[];
  register(this: RouteClass, router: Router): void;
};

export abstract class Route<Result = any> {
  static route: string;
  static type: Method;
  static requestCounter: number = 0;
  static middleware: express.RequestHandler[] = [];

  public request: express.Request;
  public response: express.Response;
  public router: Router;
  public server: Server;

  public params: any;
  public body: any;
  // public requestId: string | number;

  private _logger: Logger;
  private _requestId: string | number;

  constructor(router: Router, req: express.Request, res: express.Response) {
    this.router = router;
    this.server = router.server;
    this.request = req;
    this.response = res;

    this.params = req.params;
    this.body = req.body;
  }

  public get requestId(): string | number {
    if (this._requestId) return this._requestId;

    const cloudTrace = this.request.get('X-Cloud-Trace-Context');

    if (cloudTrace) {
      this._requestId = cloudTrace;
    } else {
      // @ts-ignore
      this._requestId = this.constructor.requestCounter++;
    }
    return this._requestId;
  }

  public get logger() {
    if (this._logger) return this._logger;

    this._logger = this.loggerFactory();

    return this._logger;
  }

  public get logData() {
    const requestIdKey = !!this.request.get('X-Cloud-Trace-Context')
      ? 'logging.googleapis.com/trace'
      : 'requestId';

    return {
      // @ts-ignore
      route: this.constructor.route,
      // @ts-ignore
      type: this.constructor.type,
      //@ts-ignore
      [requestIdKey]: this.requestId,
    };
  }

  protected loggerFactory() {
    return this.router.logger.child(this.logData) as Logger;
  }

  public publsh<D>(topic: string, data: D, meta: any = {}) {
    this.server.broker.publish(topic, data, {
      requestId: this.requestId,
      ...meta,
    });
  }

  protected send(d: Result) {
    this.response.json(d);
  }

  public abstract handler(): Promise<any>;

  static init<R extends Route>(
    this: ClassType<R>,
    ...args: ConstructorParameters<ClassType<R>>
  ) {
    const inst = new this(...args);
    return inst;
  }

  static register<R extends Route>(this: RouteClass, router: Router) {
    router.router[this.type](
      this.route,
      ...(this.middleware || []),

      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        const route = new this(router, req, res, next);

        try {
          await route.handler();
        } catch (err) {
          next(err);
        }
      },
    );
  }
}
