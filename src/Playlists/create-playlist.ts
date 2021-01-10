import { Route, Method } from '../better-fw';
import { PrismaClient, Playlist, Prisma } from '@prisma/client';
import { PlaylistRouter } from './index';

type Input = Prisma.PlaylistCreateInput;

export class CreatePlaylist extends Route {
  static route = '';
  static type = Method.Post;

  body: Input;
  response: Playlist;

  constructor(
    router: PlaylistRouter,
    private db: PrismaClient = new PrismaClient(),
  ) {
    super(router);
  }

  async handler() {
    const input = this.body;

    this.logger.debug({ input }, 'Creating new playlist');

    const result = await this.db.playlist.create({
      data: input,
    });

    this.logger.info(
      { playlistId: result.id },
      'Successfully created new playlist',
    );

    this.send(result);
  }
}
