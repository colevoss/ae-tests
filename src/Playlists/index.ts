import { Router } from '../better-fw';
import { GetPlaylists } from './get-playlists';
import { GetPlaylist } from './get-playlist';
import { App } from '../app';
import { CreatePlaylist } from './create-playlist';

export class PlaylistRouter extends Router<App> {
  route = '/playlists';

  routes = [GetPlaylists, GetPlaylist, CreatePlaylist];
}
