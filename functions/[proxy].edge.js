import { processRedirects } from '../lib/redirects.js';
import { processRewrites } from '../lib/rewrites.js';
import { redirectsConfig } from '../lib/config.js';

export default async function handler(request, context) {
  const redirectResponse = processRedirects(redirectsConfig, request);
  if (redirectResponse) {
    return redirectResponse;
  }

  const rewriteResponse = await processRewrites(redirectsConfig, request);
  if (rewriteResponse) {
    return rewriteResponse;
  }

  return fetch(request);
}
