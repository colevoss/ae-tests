import { Route, Method, Request, Response, Context } from '../better-fw';
import * as os from 'os';
import { HomeRouter } from './';

type Authed<T> = T & {
  userId: string;
};

const getCpuInfo = () => {
  const cpus = os.cpus();
  const load = os.loadavg();
  const cpu = {
    load1: load[0],
    load5: load[1],
    load15: load[2],
    cores: Array.isArray(cpus) ? os.cpus().length : null,
  };
  // @ts-ignore
  cpu.utilization = Math.min(Math.floor((load[0] * 100) / cpu.cores), 100);

  return cpu;
};

const getMemoryInfo = () => {
  const mem = {
    free: os.freemem(),
    total: os.totalmem(),
  };
  // @ts-ignore
  mem.percent = (mem.free * 100) / mem.total;

  return mem;
};

const getProcessInfo = () => {
  return {
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };
};
export class Home extends Route {
  static route = '/';
  static type = Method.Get;

  constructor(router: HomeRouter, private test: string = 'hello test') {
    super(router);
  }

  async handler() {
    this.logger.info({ test: 'hello' }, 'hello');
    this.publish('home.event', { hello: 'there' });
    this.send({
      hello: 'how are you',
      test: this.test,
      cpu: getCpuInfo(),
      memory: getMemoryInfo(),
      process: getProcessInfo(),
    });
  }
}
