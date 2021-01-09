import { Server } from '../Server';
import { PubSubPushBroker } from './PubSubPushBroker';
import { PubSubBroker } from './PubSubBroker';
import { DevBroker } from './DevBroker';
import { NatsBroker } from './NatsBroker';

const PROJ_ID = 'test-project-40236';

export function brokerRepository(server: Server): PubSubBroker;
export function brokerRepository(server: Server): PubSubPushBroker;
export function brokerRepository(server: Server): DevBroker;
export function brokerRepository(server: Server): DevBroker;
export function brokerRepository(server: Server): NatsBroker;
export function brokerRepository(server: Server): any {
  const brokerType = process.env.BROKER || 'development';

  switch (brokerType) {
    case 'PubSubPush': {
      const broker = new PubSubPushBroker(server);
      return broker;
    }

    case 'PubSub': {
      const broker = new PubSubBroker(server);
      return broker;
    }

    case 'Nats': {
      const broker = new NatsBroker(server);
      return broker;
    }

    case 'development': {
      const broker = new DevBroker(server);
      return broker;
    }

    default: {
      const broker = new DevBroker(server);
      return broker;
    }
  }
}
