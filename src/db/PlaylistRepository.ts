import { PrismaClient, Playlist } from '@prisma/client';
import { db } from './db';

export class PlaylistRepository {
  db: PrismaClient;
  constructor() {
    this.db = db();
  }

  async list() {
    return this.db.playlist.findMany();
  }

  async get(id: string | number) {
    return this.db.playlist.findUnique({
      where: {
        id: Number(id),
      },
    });
  }
}
