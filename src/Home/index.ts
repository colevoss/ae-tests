import { Router } from '../better-fw';
import { Home } from './home';
import { App } from '../app';
// import { PubSubTest } from './pubsub';

export class HomeRouter extends Router {
  route = '';

  protected routes() {
    this.registerRoute(Home);
  }
}
