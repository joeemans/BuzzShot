import 'reflect-metadata';
import { createListeningApiApp, listen } from './server.js';

async function bootstrap() {
  await listen(await createListeningApiApp());
}

void bootstrap();
