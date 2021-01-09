import * as nats from 'nats';
import { Broker } from './Broker';
import { Subscriber } from './Subscriber';
import { InitClassType } from '../types';
import { createLogger, Logger } from '../Logger';
import { EventMetadata } from './Event';
import { Server } from '..';

export const DEFAULT_NATS_CONFIG = {
  json: true,
  url: 'nats://nats:4222',
  user: 'ruser',
  pass: 'T0pS3cr3t',
};

export class NatsBroker extends Broker {
  logger: Logger;
  connection: nats.Client;

  constructor(server: Server) {
    super(server);
    this.logger = createLogger().child({
      type: 'NatsBroker',
    }) as Logger;

    this.connection = nats.connect(DEFAULT_NATS_CONFIG);
  }

  public async start() {
    this.connection.on('connect', () => {
      this.logger.info('Broker connected to nats server');
    });
  }

  async publish(topic: string, data: any, meta?: EventMetadata) {
    const payload = {
      data,
      meta: this.buildBaseEventMetadata(topic, meta),
    };

    return this.connection.publish(topic, payload);
  }

  subscribe<S extends InitClassType<Subscriber>>(subscriber: S) {
    const sub = subscriber.init(this);

    this.logger.debug(sub.logData, 'Subscribing to NATS event topic');

    this.connection.subscribe(sub.topic, async (payload: any) => {
      const event = this.buildEventFromPayload(sub, payload);

      try {
        await sub.handler(event);
      } catch (err) {
        this.logger.error(
          { ...sub.logData, err },
          'Error occurred handling NATS event',
        );
      }
    });
  }
}
