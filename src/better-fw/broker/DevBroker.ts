import { EventEmitter } from 'events';
import { Subscriber } from './Subscriber';
import { InitClassType } from '../types';
import { createLogger, Logger } from '../Logger';
import { EventMetadata } from './Event';
import { Broker } from './Broker';
import { Server } from '..';

export class DevBroker extends Broker {
  logger: Logger;
  emitter: EventEmitter;

  constructor(server: Server) {
    super(server);
    this.emitter = new EventEmitter();

    this.logger = createLogger().child({ broker: 'DevBroker' }) as Logger;
  }

  publish(topic: string, data: any, meta?: EventMetadata) {
    const payload = {
      data,
      meta: this.buildBaseEventMetadata(topic, meta),
    };

    return Promise.resolve().then(() => this.emitter.emit(topic, payload));
  }

  async start() {
    this.logger.debug('Dev Broker started :P');
  }

  subscribe<S extends InitClassType<Subscriber>>(subClass: S) {
    const sub = subClass.init(this);
    this.logger.debug(sub.logData, 'Subscribing to dev event topic');

    this.emitter.on(sub.topic, async (payload: any) => {
      const event = this.buildEventFromPayload(sub, payload);

      try {
        await sub.handler(event);
      } catch (err) {
        this.logger.error(
          { ...sub.logData, err },
          'Error occurred handling dev event',
        );
      }
    });
  }
}
