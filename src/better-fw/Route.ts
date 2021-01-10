import * as express from 'express';
import { Method, ClassType } from './types';
import { Server } from './Server';
import { Logger } from './Logger';
export { Method } from './types';
import { Router } from './Router';
import * as assert from 'assert';

export type RouteClass = ClassType<Route> & {
  route: string;
  type: Method;
  middleware: express.RequestHandler[];
  init(
    router: Router,
    request: express.Request,
    response: express.Response,
  ): Route;
  register(this: RouteClass, router: Router): void;
  assertRouteValidity(): void;
};

export abstract class Route {
  static route: string;
  static type: Method;
  static requestCounter: number = 0;
  static middleware: express.RequestHandler[] = [];

  public req: express.Request;
  public res: express.Response;
  public router: Router;
  public server: Server;

  public params: any;
  public body: any;
  public response: any;

  private _logger: Logger;
  private _requestId: string | number;

  constructor(router: Router) {
    this.router = router;
    this.server = router.server;
  }

  public get requestId(): string | number {
    if (this._requestId) return this._requestId;

    const cloudTrace = this.req.get('X-Cloud-Trace-Context');

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
    const requestIdKey = !!this.req.get('X-Cloud-Trace-Context')
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

  public publish<D>(topic: string, data: D, meta: any = {}) {
    this.server.broker.publish(topic, data, {
      requestId: this.requestId,
      ...meta,
    });
  }

  protected send(data: this['response']) {
    this.response.json(data);
  }

  public abstract handler(): Promise<any>;

  private setupRequest(req: express.Request, res: express.Response) {
    this.req = req;
    this.response = res;

    this.params = req.params;
    this.body = req.body;
  }

  static init<R extends Route>(
    this: ClassType<R>,
    router: Router,
    request: express.Request,
    response: express.Response,
    ...args: ConstructorParameters<ClassType<R>>
  ) {
    const inst = new this(router, ...args);
    inst.setupRequest(request, response);
    return inst;
  }

  static assertRouteValidity() {
    assert.notStrictEqual(
      this.route,
      undefined,
      `${this.name} does not have \`static route\` property set.`,
    );

    assert.notStrictEqual(
      this.type,
      undefined,
      `${this.name} does not have \`static type\` property set.`,
    );
  }

  static register(this: RouteClass, router: Router) {
    this.assertRouteValidity();

    router.router[this.type](
      this.route,
      ...(this.middleware || []),

      async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        const route = this.init(router, req, res);

        try {
          await route.handler();
        } catch (err) {
          next(err);
        }
      },
    );
  }
}
