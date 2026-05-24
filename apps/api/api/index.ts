import type { IncomingMessage, ServerResponse } from 'node:http';
import { createApiApp } from '../src/server.js';

const appPromise = createApiApp().then(async (app) => {
  await app.init();
  return app.getHttpAdapter().getInstance();
});

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const app = await appPromise;
  app(request, response);
}
