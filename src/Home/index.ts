import { Router } from '../better-fw';
import { Home } from './home';
import { App } from '../app';
import { PubSubTest } from './pubsub';

export class HomeRouter extends Router<App> {
  route = '/';
  routes: any[] = [Home, PubSubTest];
}
