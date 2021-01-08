import { Route, Method, Request, Response, HttpErrors } from '../better-fw';
import { PrismaClient, Playlist } from '@prisma/client';
import { PlaylistRouter } from './index';

export class GetPlaylists extends Route<PlaylistRouter> {
  route = '';
  type = Method.Get;

  constructor(
    router: PlaylistRouter,
    private db: PrismaClient = new PrismaClient(),
  ) {
    super(router);
  }

  async handler(req: Request, res: Response<Playlist[]>) {
    this.logger.debug('Getting playlists');

    const playlists = await this.db.playlist.findMany();

    res.json(playlists);

    this.logger.info('Successfully got playlists');
  }
}
