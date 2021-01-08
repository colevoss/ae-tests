import * as express from 'express';
import { Server } from './Server';
import { Router } from './Router';
import { Route } from './Route';
import { Loggable } from './types';
import { Logger } from './Logger';

let CONST_REQUEST_COUNTER = 0;

export class Context<R extends Route = Route> {
  public route: R;
  public request: express.Request;
  public response: express.Response;
  public requestId: string | number;
  public logger: Logger;

  constructor(route: R, request: express.Request, response: express.Response) {
    this.route = route;
    this.request = request;
    this.response = response;
    this.requestId = this.getRequestId();
    this.logger = this.loggerFactor();
  }

  private getRequestId() {
    const cloudTrace = this.request.header('X-Cloud-Trace-Context');
    let requestId: string | number;

    if (cloudTrace) {
      [requestId] = cloudTrace.split('/');
    } else {
      requestId = CONST_REQUEST_COUNTER++;
    }

    return requestId;
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
      }/traces/${this.requestId}`;
    }

    return this.requestId;
  }

  protected loggerFactor() {
    return this.route.logger.child({
      [this.requestIdLogKey()]: this.requestIdValue(),
    }) as Logger;
  }

  public publish<D>(topic: string, data: D, meta: any = {}) {
    this.route.server.broker.publish(topic, data, {
      requestId: this.requestId,
      ...meta,
    });
  }
}
