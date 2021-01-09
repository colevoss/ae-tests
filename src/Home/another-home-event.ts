import { Subscriber, Event } from '../better-fw';

interface Payload {
  hello: string;
}

export class AnotherHomeEvent extends Subscriber {
  topic = 'another.home.event';
  name = 'my-other-event';

  async handler(evt: Event<Payload>) {
    evt.logger.info(
      { data: evt.data, meta: evt.meta },
      'Another home event yeah',
    );
  }
}
