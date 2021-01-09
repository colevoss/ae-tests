import { Subscriber, Event } from '../better-fw';

interface Payload {
  hello: string;
}

export class HomeEvent extends Subscriber {
  topic = 'home.event';
  name = 'my-event';

  async handler(evt: Event<Payload>) {
    evt.logger.info(
      { data: evt.data, meta: evt.meta },
      'RECEIVED EVENT FROM HOME',
    );

    await evt.publish('another.home.event', { howdy: 'all' });
  }
}
