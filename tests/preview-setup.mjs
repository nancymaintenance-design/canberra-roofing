import { startPreview } from '../scripts/preview.mjs';
export default async function setup() {
  const preview = await startPreview({ port: 4175 });
  return async () => { preview.server.closeAllConnections(); await preview.close(); };
}
