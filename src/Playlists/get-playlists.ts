import { Route, Method } from '../better-fw';
import { Playlist } from '@prisma/client';
import { PlaylistRouter } from './index';
import { PlaylistRepository } from '../db/PlaylistRepository';

export class GetPlaylists extends Route {
  static route = '';
  static type = Method.Get;

  response: Playlist[];

  constructor(
    router: PlaylistRouter,
    private pr: PlaylistRepository = new PlaylistRepository(),
  ) {
    super(router);
  }

  async handler() {
    // this.logger.debug('Getting playlists');
    // const playlists = await this.db.playlist.findMany();
    const playlists = await this.pr.list();
    this.send(playlists);
    // this.logger.info('Successfully got playlists');
  }
}
