import { Broker } from './Broker';
import { Logger } from '../better-fw/Logger';
import { Subscriber } from './Subscriber';

export interface EventMetadata {
  [k: string]: any;
  timestamp: string;
  topic: string;
}

// Might want to rename to Context
export class Event<D = any, B extends Broker = Broker> {
  public data: D;
  public broker: B;
  public subscriber: Subscriber;
  public meta: EventMetadata;
  public logger: Logger;

  constructor(broker: B, subscriber: Subscriber, data: D, meta: EventMetadata) {
    this.broker = broker;
    this.data = data;
    this.meta = meta;
    this.subscriber = subscriber;
    this.logger = this.loggerFactory();
  }

  async publish<D>(topic: string, data: D, meta?: EventMetadata) {
    const publishMeta = {
      ...this.meta,
      ...(meta || {}),
    };

    await this.broker.publish(topic, data, publishMeta);
  }

  private requestIdLogKey() {
    if (process.env.NODE_ENV === 'production') {
      return 'logging.googleapis.com/trace';
    }

    return 'requestId';
  }

  private requestIdValue() {
    if (process.env.NODE_ENV === 'production') {
      return `projects/${
        process.env.GOOGLE_CLOUD_PROJECT || 'PROJECT_ID'
      }/traces/${this.meta.requestId}`;
    }

    return this.meta.requestId;
  }

  private loggerFactory() {
    let childData: { [key: string]: string } = {};

    if (this.meta.hasOwnProperty('requestId')) {
      childData[this.requestIdLogKey()] = this.requestIdValue();
    }

    return this.subscriber.logger.child(childData) as Logger;
  }
}
