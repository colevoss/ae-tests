import * as express from 'express';
import { Subscriber } from './Subscriber';
import { createLogger, Logger } from '../Logger';
import { Broker } from './Broker';
import { PubSub, Topic, Subscription } from '@google-cloud/pubsub';
import { InitClassType } from '../types';
import { Server } from '..';
import { EventMetadata } from './Event';

export class PubSubPushBroker extends Broker {
  public logger: Logger;
  private pubsub: PubSub;
  private router: express.Router;
  private topics = new Map<string, Topic>();
  private subscribers = new Set<Subscriber>();

  constructor(server: Server) {
    super(server);

    this.pubsub = new PubSub();
    this.router = express.Router();
    this.router.use(express.json());
    this.logger = createLogger().child({
      type: 'PubSubPushBroker',
    }) as Logger;
  }

  public async start() {
    this.logger.info('Registering PubSub Push Router');
    this.server.app.use('/pubsub', this.router);

    await this.initTopics();
    await this.initSubscriptions();
  }

  public publish(topic: string, data: any, meta?: EventMetadata) {
    const payload = {
      data,
      meta: this.buildBaseEventMetadata(topic, meta),
    };

    try {
      return this.pubsub.topic(topic).publishJSON(payload);
    } catch (err) {
      this.logger.error(
        { err, topic },
        'Error publishing event to PubSub topic',
      );
    }
  }

  private async initTopics() {
    this.logger.info('Initializing Topics');
    const topicPromises: PromiseLike<any>[] = [];

    this.topics.forEach((topic, name) => {
      topicPromises.push(this.initTopic(topic));
    });

    await Promise.all(topicPromises);
  }

  private async initTopic(topic: Topic) {
    this.logger.info({ topic: topic.name }, 'Initializing PubSub Topic');
    const [topicExists] = await topic.exists();

    if (topicExists) {
      this.logger.info({ topic: topic.name }, 'Topic exists.');
      return topic;
    }

    this.logger.debug(
      { topic: topic.name },
      'Topic does not exist. Creating new PubSub Topic',
    );
    const [createdTopic] = await topic.create();

    this.logger.info({ topic: topic.name }, 'Pubsub Topic created.');
    return createdTopic;
  }

  private async initSubscriptions() {
    this.logger.info('Initializing Subscriptions');
    const subscriptionPromises: PromiseLike<any>[] = [];

    for (const subscriber of this.subscribers) {
      subscriptionPromises.push(this.initSubscription(subscriber));
    }

    await Promise.all(subscriptionPromises);
  }

  private async initSubscription(subscriber: Subscriber) {
    const topic = this.topics.get(subscriber.topic);
    let subscription = topic.subscription(subscriber.name);

    this.logger.info(subscriber.logData, 'Initializing Subscription');

    const [subscriptionExists] = await subscription.exists();

    if (!subscriptionExists) {
      subscription = await this.createSubscription(subscriber, subscription);
    } else {
      subscription = await this.ensureSubscription(subscriber, subscription);
    }

    return subscription;
  }

  private async createSubscription(
    subscriber: Subscriber,
    subscription: Subscription,
  ) {
    this.logger.info(
      subscriber.logData,
      'Creating PubSub Push Subscription for topic',
    );
    const pushEndpoint = `${
      process.env.APP_ENGINE_URL
    }/pubsub${this.getRouteFromSubscriber(subscriber)}`;

    try {
      const [createdSubscription] = await subscription.create({
        pushEndpoint,
      });
      return createdSubscription;
    } catch (err) {
      this.logger.error(
        {
          ...subscriber.logData,
          err,
        },
        'Error occurred when creating subscription',
      );
    }
  }

  private async ensureSubscription(
    subscriber: Subscriber,
    subscription: Subscription,
  ) {
    this.logger.info(
      subscriber.logData,
      'Ensuring PubSub Push subscription is valid',
    );

    try {
      const [
        ensuringSubscription,
        subscriptionMetadata,
      ] = await subscription.get();

      const pushEndpoint = `${
        process.env.APP_ENGINE_URL
      }/pubsub${this.getRouteFromSubscriber(subscriber)}`;

      const isValid =
        subscriptionMetadata.pushConfig?.pushEndpoint === pushEndpoint;

      if (!isValid) {
        this.logger.info(
          subscriber.logData,
          'Subscription is not valid. Deleting Subscription and creating a new one.',
        );
        await ensuringSubscription.delete();
        return await this.createSubscription(subscriber, subscription);
      }

      this.logger.info(subscriber.logData, 'Subscription is valid');

      return ensuringSubscription;
    } catch (err) {
      this.logger.error(
        {
          ...subscriber.logData,
          err,
        },
        'Error occurred when ensuring subscription',
      );
    }
  }

  public subscribe<S extends InitClassType<Subscriber>>(subClass: S) {
    const subscriber = subClass.init(this);
    const route = this.getRouteFromSubscriber(subscriber);
    this.logger.info(`Initializing event handler at /pubsub${route}`);

    const topic = this.pubsub.topic(subscriber.topic);

    this.topics.set(subscriber.topic, topic);
    this.subscribers.add(subscriber);

    const handler = async (
      req: express.Request,
      resp: express.Response,
      next: express.NextFunction,
    ) => {
      try {
        const dataString = Buffer.from(
          req.body.message.data,
          'base64',
        ).toString('utf-8');

        const data = JSON.parse(dataString);
        const event = this.buildEventFromPayload(subscriber, data);

        await subscriber.handler(event);
        resp.sendStatus(200);
      } catch (err) {
        next(err);
      }
    };

    this.router.post(route, handler);
  }

  private getRouteFromSubscriber(subscriber: Subscriber) {
    const topic = subscriber.topic;
    const subscription = subscriber.name;

    const topicRoute = topic.replace(/\./g, '-');
    const subscriptionRoute = `/${topicRoute}/${subscription}`;

    return subscriptionRoute;
  }
}
