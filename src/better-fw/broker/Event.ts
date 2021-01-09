import { Broker } from './Broker';
import { Logger } from '../Logger';
import { Subscriber } from './Subscriber';

export interface EventMetadata {
  [k: string]: any;
  timestamp: string;
  topic: string;
}

/**
 * Class to be passed to Subscriber handler functions that encapulates event payloads,
 * metadata, and requestId's as well as event/request scoped logging and event publishing
 */
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

  /**
   * Publish a message to a topic and include the request id for request tracing
   */
  async publish<D>(topic: string, data: D, meta?: EventMetadata) {
    const publishMeta = {
      ...this.meta,
      ...(meta || {}),
    };

    await this.broker.publish(topic, data, publishMeta);
  }

  /**
   * Determines the log key for the request id for tracing purposes. If we are in
   * production, use Google Logging's specified log key so we can trace logs for
   * this request in the logs.
   *
   * @see https://cloud.google.com/logging/docs/agent/configuration#special-fields
   */
  private requestIdLogKey() {
    if (process.env.NODE_ENV === 'production') {
      return 'logging.googleapis.com/trace';
    }

    return 'requestId';
  }

  /**
   * In production, use the Google logging trace format
   *
   * @see https://cloud.google.com/logging/docs/agent/configuration#special-fields
   */
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
