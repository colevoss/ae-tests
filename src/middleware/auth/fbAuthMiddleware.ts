import * as admin from 'firebase-admin';
import * as express from 'express';
import { HttpErrors } from '../../better-fw';
import { Server } from '../../better-fw';

admin.initializeApp();

export function fbAuthMiddleware<S extends Server>(server: S) {
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

    try {
      const decoded = await admin.auth().verifyIdToken(token);
      const { uid } = decoded;

      // @ts-ignore
      req.userId = uid;

      next();
    } catch (err) {
      server.logger.error(err, 'Error verifyting auth token');
      next(new HttpErrors.Unauthorized('Unauthorized'));
    }
  };
}
