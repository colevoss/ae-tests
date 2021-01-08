import * as dotenv from 'dotenv';
import { App } from './app';

dotenv.config();

const app = App.new();

async function main() {
  await app.start();
}

main();
