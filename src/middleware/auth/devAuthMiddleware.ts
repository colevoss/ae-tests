import * as admin from 'firebase-admin';
import * as express from 'express';
import { HttpErrors } from '../../better-fw';
import { Server } from '../../better-fw';

export function devAuthMiddleware<S extends Server>(server: S) {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      next(new HttpErrors.Unauthorized('Unauthroized'));
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      next(new HttpErrors.Unauthorized('Unauthorized'));
    }

    const [, token] = authHeader.split('Bearer ');

    // @ts-ignore
    req.userId = token;
    next();
  };
}
