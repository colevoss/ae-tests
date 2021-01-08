import { Logger } from '../better-fw/Logger';
import { InitClassType, Loggable } from '../better-fw/types';
import { Server } from '../better-fw';
import { Subscriber } from './Subscriber';
import { EventMetadata, Event } from './Event';

export interface IBroker {
  logger: Logger;
  server: Server;
  subscribe<S extends InitClassType<Subscriber>>(subscriber: S): any;
  publish(topic: string, data: any, meta?: EventMetadata): any;
  start(): PromiseLike<any>;
}

export abstract class Broker implements IBroker {
  logger: Logger;
  server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  abstract subscribe<S extends InitClassType<Subscriber>>(subscriber: S): any;
  abstract publish(topic: string, data: any, meta?: EventMetadata): any;
  abstract start(): PromiseLike<any>;

  protected buildBaseEventMetadata(
    topic: string,
    meta?: EventMetadata,
  ): EventMetadata {
    return {
      ...(meta || {}),
      timestamp: new Date().toISOString(),
      topic,
    };
  }

  protected buildEventFromPayload(subscriber: Subscriber, payload: any) {
    const hasMeta = payload.hasOwnProperty('meta');
    const hasData = payload.hasOwnProperty('data');

    let data: object;
    let meta: EventMetadata;

    if (!hasData && !hasMeta) {
      meta = this.buildBaseEventMetadata(subscriber.topic);
      data = payload;
    }

    if (hasData && !hasMeta) {
      meta = this.buildBaseEventMetadata(subscriber.topic);
      data = payload.data;
    }

    if (hasMeta && !hasData) {
      meta = payload.meta;
      data = {};
    }

    if (hasMeta && hasData) {
      meta = payload.meta;
      data = payload.data;
    }

    return new Event(this, subscriber, data, meta);
  }
}
