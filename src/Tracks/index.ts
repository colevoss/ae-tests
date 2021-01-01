import { Router, Method, Request, Response } from '../better-fw';
import { GetTrack } from './get-track';
import { App } from '../app';

export class TracksRouter extends Router<App> {
  route = '/tracks';
  routes = [GetTrack];
}
