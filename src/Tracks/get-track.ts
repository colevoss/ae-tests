import { Route, Method, Request, Response, HttpErrors } from '../better-fw';
import { TracksRouter } from './';

export class GetTrack extends Route<TracksRouter> {
  route = '';
  type = Method.Get;

  constructor(r: TracksRouter, private test = 'asdfasdfasdf') {
    super(r);
  }

  async handler(req: Request, res: Response) {
    this.logger.info({ test: 'hello' }, 'hello');
    res.json({ test: 'hello!!!!!!!!!!' });
  }
}
