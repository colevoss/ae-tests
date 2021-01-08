import { Route, Method, Request, Response, HttpErrors } from '../better-fw';
import { PrismaClient, Playlist } from '@prisma/client';
import { PlaylistRouter } from './index';

type Input = Partial<Playlist>;

export class CreatePlaylist extends Route<PlaylistRouter> {
  route = '';
  type = Method.Post;

  constructor(
    r: PlaylistRouter,
    private db: PrismaClient = new PrismaClient(),
  ) {
    super(r);
  }

  async handler(req: Request<{}, Input>, resp: Response<Playlist>) {
    const input = req.body;

    this.logger.debug({ input }, 'Creating new playlist');

    const result = await this.db.playlist.create({
      data: input,
    });

    this.logger.info(
      { playlistId: result.id },
      'Successfully created new playlist',
    );

    resp.json(result);
  }
}
