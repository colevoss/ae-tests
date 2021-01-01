import { Server } from './better-fw';
import { TracksRouter } from './Tracks';
import { PlaylistRouter } from './Playlists';

export class App extends Server {
  routers: any[] = [TracksRouter, PlaylistRouter];
}
