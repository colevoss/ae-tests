import { Route, Method, Request, Response, HttpErrors } from '../better-fw';
import { PrismaClient, Playlist } from '@prisma/client';
import { PlaylistRouter } from './index';

type GetPlaylistParams = {
  id: string;
};

export class GetPlaylist extends Route<PlaylistRouter> {
  route = '/:id';
  type = Method.Get;

  constructor(
    r: PlaylistRouter,
    private db: PrismaClient = new PrismaClient(),
  ) {
    super(r);
  }

  async handler(req: Request<GetPlaylistParams>, resp: Response<Playlist>) {
    const id = req.params.id;

    const result = await this.db.playlist.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        tracks: {
          where: {
            active: true,
          },
        },
      },
    });

    if (!result) {
      throw new HttpErrors.NotFound('Playlist not found', {
        playlistId: id,
      });
    }

    resp.json(result);
    this.logger.info({ playlistId: id }, 'Successfully queried for playlist');
  }
}
