
import { shouldApplyRule, resolveDestination, createHeaders } from './common.js';

export async function processRewrites(config, request) {
  if (!config.rewrites || config.rewrites.length === 0) {
    return null;
  }

  const url = new URL(request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  for (const rewrite of config.rewrites) {
    if (shouldApplyRule(rewrite, hostname, pathname, request)) {
      const destination = resolveDestination(rewrite.destination, url);
      
      console.log(`Rewriting ${url.href} -> ${destination}`);

      const rewriteRequest = new Request(destination, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      try {
        const response = await fetch(rewriteRequest);

        if (rewrite.response?.headers) {
          const modifiedHeaders = createHeaders(response.headers, rewrite.response.headers);
          
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: modifiedHeaders
          });
        }
        
        return response;
      } catch (error) {
        console.error(`Rewrite failed for ${destination}:`, error);
        return null;
      }
    }
  }
  
  return null;
}
