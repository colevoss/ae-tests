import { PrismaClient } from '@prisma/client';

let _db: PrismaClient;

export const db = () => {
  if (_db) return _db;

  _db = new PrismaClient();

  return _db;
};
