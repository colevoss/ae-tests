// import { Route, Router, Method, Request, Response, Context } from './better-fw';

// type Authed<T> = T & {
//   userId: string;
// };

// export class WarmUpRoute extends Route<WarmUpRouter> {
//   route = '/warmup';
//   type = Method.Get;

//   async handler(ctx: Context, req: Authed<Request>, res: Response) {
//     ctx.logger.info({ healthy: 'OK' }, 'Health Check');
//     res.json({ ok: 'warmup' });
//   }
// }

// export class WarmUpRouter extends Router {
//   route = '/_ah';

//   routes() {
//     this.registerRoute(WarmUpRoute);
//   }
// }
