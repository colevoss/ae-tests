// import { Server } from '../better-fw/Server';
// import { Method } from '../better-fw/types';
// import { Route } from './Route';
// import { Router } from './Router';

// class GetRoute extends Route {
//   static route = '/:id';
//   static type = Method.Get;
//   server: TestServer;
//   router: TestRouter;

//   params: { id: string };

//   async handler() {
//     this.logger.info('HELLO');
//     this.send({ hello: 'how are you' });
//   }
// }

// class PostRoute extends Route {
//   static route = '/:id';
//   static type = Method.Post;
//   server: TestServer;
//   router: TestRouter;

//   params: { id: string };
//   body: {
//     test: string;
//   };

//   async handler() {
//     this.logger.info('HELLO');
//     this.send({ hello: 'how are you' });
//   }
// }
// class TestRouter extends Router {
//   route = '/test';
//   balls() {
//     console.log('Server!');
//   }

//   routes() {
//     this.registerRoute(GetRoute);
//     this.registerRoute(PostRoute);
//   }
// }

// class TestServer extends Server {
//   balls() {
//     console.log('Server!');
//   }

//   protected routers() {
//     this.registerRouter(TestRouter);
//   }
// }

// const testServer = TestServer.new();

// const main = async () => {
//   await testServer.start();
// };

// main();
