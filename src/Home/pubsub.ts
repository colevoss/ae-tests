import { Route, Method, Request, Response, Context } from '../better-fw';

export class PubSubTest extends Route {
  route = '/pubsub';
  type = Method.Post;

  async handler(ctx: Context, req: Request, res: Response) {
    // const messageBuffer = req.body.message.data;
    // const messageStr = messageBuffer.toString();
    const message = Buffer.from(req.body.message.data, 'base64').toString(
      'utf-8',
    );
    // const data = JSON.parse(message);

    this.logger.info({ messageData: message }, 'Message data');
    this.logger.info({ body: req.body }, 'Message body');

    res.status(200).send();
  }
}
