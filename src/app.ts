import { Server } from './better-fw';
import { TracksRouter } from './Tracks';
import { HomeRouter } from './Home';
import { PlaylistRouter } from './Playlists';
import { HomeEvent } from './Home/home-event';
import { AnotherHomeEvent } from './Home/another-home-event';
import { authMiddleware } from './middleware/auth';
import { WarmUpRouter } from './warmup';

export class App extends Server {
  routers: any[] = [TracksRouter, PlaylistRouter, HomeRouter, WarmUpRouter];
  subscribers = [HomeEvent, AnotherHomeEvent];
  // routers: any[] = [TracksRouter, HomeRouter];
}
