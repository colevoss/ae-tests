import { PubSub, Topic, Subscription, Message } from '@google-cloud/pubsub';

const pubsub = new PubSub({ projectId: 'test-project-40236' });
const topicName = 'home.event';

const map = new Map<string, Topic>();

const getOrCreateTopic = async (topicName: string) => {
  if (map.has(topicName)) {
    return map.get(topicName);
  }

  let topic = pubsub.topic(topicName);
  const topicExists = await topic.exists();

  if (!topicExists) {
    [topic] = await topic.create();
  }

  map.set(topicName, topic);

  return topic;
};

const createSub = async () => {
  // const [subscrption] = await pubsub
  //   .topic('home.event')
  //   .createSubscription('push-test', {
  //     pushEndpoint:
  //       'https://playlist-service-dot-test-project-40236.uc.r.appspot.com/pubsub',
  //   });

  // console.log('SUCESS!!!!!!');
  // console.log(subscrption);
  console.time('Starting');

  const topic = await getOrCreateTopic('home.event');
  console.log(topic.name);
  const sub = topic.subscription('test-sub');

  console.timeEnd('Starting');
};

createSub();
