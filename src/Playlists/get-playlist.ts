import { Route, Method, HttpErrors } from '../better-fw';
import { PrismaClient, Playlist } from '@prisma/client';
import { PlaylistRouter } from './index';
import { PlaylistRepository } from '../db/PlaylistRepository';

type GetPlaylistParams = {
  id: string;
};

export class GetPlaylist extends Route {
  static route = '/:id';
  static type = Method.Get;

  params: GetPlaylistParams;
  response: Playlist;

  constructor(
    r: PlaylistRouter,
    private pr: PlaylistRepository = new PlaylistRepository(),
  ) {
    super(r);
  }

  async handler() {
    const id = this.params.id;

    const playlist = await this.pr.get(id);

    // const result = await this.db.playlist.findUnique({
    //   where: {
    //     id: Number(id),
    //   },
    //   include: {
    //     tracks: {
    //       where: {
    //         active: true,
    //       },
    //     },
    //   },
    // });

    if (!playlist) {
      throw new HttpErrors.NotFound('Playlist not found', {
        playlistId: id,
      });
    }

    this.send(playlist);
    this.logger.info({ playlistId: id }, 'Successfully queried for playlist');
  }
}
