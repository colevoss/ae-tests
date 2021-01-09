import {
  Route,
  Router,
  Method,
  Request,
  Response,
  Context,
  Server,
} from '../better-fw';
import { HomeEvent } from '../Home/home-event';
import { AnotherHomeEvent } from '../Home/another-home-event';
import { WarmUpRouter } from '../warmup';

type Authed<T> = T & {
  userId: string;
};

export class HealthCheck extends Route<EventsRouter> {
  route = '';
  type = Method.Get;

  constructor(r: EventsRouter) {
    super(r);
  }

  async handler(ctx: Context, req: Authed<Request>, res: Response) {
    ctx.logger.info({ healthy: 'OK' }, 'Health Check');
    res.json({ ok: 'ok' });
  }
}

export class EventsRouter extends Router {
  route = '/';
  routes = [HealthCheck];
}

export class EventServer extends Server {
  routers: any[] = [EventsRouter, WarmUpRouter];
  subscribers = [HomeEvent, AnotherHomeEvent];
}
