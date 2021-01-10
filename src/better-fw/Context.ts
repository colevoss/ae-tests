import * as express from 'express';
import { Route } from './Route';
import { Request, Response } from './types';
import { Logger } from './Logger';

let CONST_REQUEST_COUNTER = 0;

/**
 * A request scoped class to be used for request tracing and event publishing
 */
export class Context<R extends Route = Route> {
  public route: R;
  public request: Request;
  public response: Response;
  public requestId: string | number;
  public logger: Logger;

  constructor(route: R, request: Request, response: Response) {
    this.route = route;
    this.request = request;
    this.response = response;
    this.requestId = this.getRequestId();
    this.logger = this.loggerFactor();
  }

  /**
   * Gets or creates a request ID for the context. If request is from Google app
   * engine, we will use their tracing context coming from them otherwise create
   * a request ID by increminting a global counter.
   */
  private getRequestId() {
    /**
     * Header from requests coming through Google App Engine containing the
     * trace and span ids
     * @see https://cloud.google.com/trace/docs/setup
     */
    const cloudTrace = this.request.header('X-Cloud-Trace-Context');
    let requestId: string | number;

    if (cloudTrace) {
      [requestId] = cloudTrace.split('/');
    } else {
      requestId = CONST_REQUEST_COUNTER++;
    }

    return requestId;
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
      }/traces/${this.requestId}`;
    }

    return this.requestId;
  }

  protected loggerFactor() {
    return this.route.logger.child({
      [this.requestIdLogKey()]: this.requestIdValue(),
    }) as Logger;
  }

  /**
   * Publish a message to a topic and include the request id for request tracing
   */
  public publish<D>(topic: string, data: D, meta: any = {}) {
    this.route.server.broker.publish(topic, data, {
      requestId: this.requestId,
      ...meta,
    });
  }
}
