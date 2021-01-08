import { ClassType, Loggable } from '../better-fw/types';
import { Broker } from './Broker';
import { Event } from './Event';
import { Logger } from '../better-fw/Logger';

export abstract class Subscriber<B extends Broker = Broker> extends Loggable {
  public topic: string;
  public name: string;
  public broker: B;

  constructor(broker: B) {
    super();
    this.broker = broker;
  }

  get logData() {
    return {
      topic: this.topic,
      subscription: this.name,
    };
  }

  protected loggerFactory() {
    return this.broker.logger.child({
      topic: this.topic,
      subscription: this.name,
    }) as Logger;
  }

  // abstract handler(data: any): PromiseLike<any>;
  abstract handler(event: Event<any, B>): PromiseLike<any>;

  static init<S extends Subscriber, B extends Broker = Broker>(
    this: ClassType<S>,
    broker: B,
    ...args: any[]
  ) {
    const inst = new this(broker, ...args);

    inst.initLogger();

    return inst;
  }
}
