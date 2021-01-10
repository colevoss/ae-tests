import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub';
import { Subscriber } from './Subscriber';
import { createLogger, Logger } from '../Logger';
import { InitClassType } from '../types';
import { EventMetadata } from './Event';
import { Broker } from './Broker';
import { Server } from '..';

export class PubSubBroker extends Broker {
  public logger: Logger;
  private pubsub: PubSub;

  constructor(server: Server) {
    super(server);

    this.pubsub = new PubSub();
    this.logger = createLogger().child({
      broker: 'PubSubBroker',
    }) as Logger;
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

  public async start() {}

  private async getOrCreatePubSubTopic<S extends Subscriber>(
    subscriber: S,
  ): Promise<Topic> {
    const logData = { topic: subscriber.topic };

    let topic = this.pubsub.topic(subscriber.topic);

    this.logger.debug(logData, 'Checking for existing topic');
    const [topicExists] = await topic.exists();

    if (topicExists) {
      this.logger.debug(logData, 'Topic already exists.');
      return topic;
    }

    this.logger.debug(logData, 'Topic does not exist. Creating topic');

    try {
      const [createdTopic] = await topic.create();
      topic = createdTopic;
      this.logger.info(logData, 'Topic successfully created');

      return topic;
    } catch (err) {
      this.logger.error({ ...logData, err }, 'Error creating topic');
    }
  }

  private async getOrCreatePubSubSubscription<S extends Subscriber>(
    topic: Topic,
    subscriber: S,
  ): Promise<Subscription> {
    this.logger.debug(
      subscriber.logData,
      'Checking for existing subscription on topic',
    );

    let subscription = topic.subscription(subscriber.name);
    let [subscriptionExists] = await subscription.exists();

    if (subscriptionExists) {
      this.logger.debug(
        subscriber.logData,
        'Subscription on topic already exists.',
      );
      return subscription;
    }

    this.logger.debug(
      subscriber.logData,
      'Subscription on topic does not exist. Creating subscription.',
    );

    try {
      const [createdSubscription] = await subscription.create();
      subscription = createdSubscription;

      this.logger.info(
        subscriber.logData,
        'Subscription on topic successfully created.',
      );

      return subscription;
    } catch (err) {
      this.logger.error(
        { ...subscriber.logData, err },
        'Error creating subscription on topic.',
      );
    }
  }

  public async subscribe<S extends InitClassType<Subscriber>>(subClass: S) {
    const sub = subClass.init(this);
    this.logger.info(sub.logData, 'Registering subscription to topic');

    const topic = await this.getOrCreatePubSubTopic(sub);
    const subscription = await this.getOrCreatePubSubSubscription(topic, sub);

    subscription.on('message', async (message: Message) => {
      const timestamp = message.publishTime.toISOString();

      const dataString = message.data.toString();
      const data = JSON.parse(dataString);

      const meta = {
        ...(data.meta || {}),
        timestamp: timestamp,
        topic: sub.topic,
      };

      const event = this.buildEventFromPayload(sub, {
        meta,
        data: data.data || data,
      });

      try {
        await sub.handler(event);

        message.ack();
      } catch (err) {
        this.logger.error(
          { err, ...sub.logData },
          'Error occurred handling pubsub message',
        );

        // Not sure if we want to do that here?
        message.ack();
      }
    });
  }
}
