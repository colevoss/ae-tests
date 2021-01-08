import { Server } from '../../better-fw';

export function authMiddleware<S extends Server>(server: S) {
  let auth: any;

  if (process.env.NODE_ENV === 'production') {
    const { fbAuthMiddleware } = require('./fbAuthMiddleware');
    auth = fbAuthMiddleware;
  } else {
    const { devAuthMiddleware } = require('./devAuthMiddleware');
    auth = devAuthMiddleware;
  }

  return auth(server);
}
