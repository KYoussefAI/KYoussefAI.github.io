import { preview } from 'astro';

// Keep the preview in the foreground so Playwright owns its lifecycle.
const server = await preview({ server: { host: '127.0.0.1', port: 4322 } });
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => { await server.stop(); process.exit(0); });
}
