import { Route, Method, Request, Response, Context } from '../better-fw';
import { cpus } from 'os';
import { HomeRouter } from './';

type Authed<T> = T & {
  userId: string;
};

export class Home extends Route<HomeRouter> {
  route = '';
  type = Method.Get;

  async handler(ctx: Context, req: Authed<Request>, res: Response) {
    ctx.logger.info({ test: 'hello', userId: req.userId }, 'hello');
    ctx.publish('home.event', { hello: 'there' });
    const cpuCount = cpus().length;
    res.json({ hello: 'FROM GITHUB' });
  }
}
