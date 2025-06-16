import { processRedirects } from '../lib/redirects.js';
import { processRewrites } from '../lib/rewrites.js';
import { redirectsConfig } from '../lib/config.js';

export default async function handler(request, context) {
  console.log('Handler called with URL:', request.url);

  const redirectResponse = processRedirects(redirectsConfig, request);
  if (redirectResponse) {
    console.log('Returning redirect response:', redirectResponse.status, redirectResponse.headers.get('Location'));
    return redirectResponse;
  }

  const rewriteResponse = await processRewrites(redirectsConfig, request);
  if (rewriteResponse) {
    console.log('Returning rewrite response');
    return rewriteResponse;
  }

  console.log('No redirect/rewrite match, forwarding to origin');
  return fetch(request);
}
