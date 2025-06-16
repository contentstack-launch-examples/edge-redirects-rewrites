
import { shouldApplyRule, resolveDestination, createHeaders } from './common.js';

export function processRedirects(config, request) {
  if (!config.redirects || config.redirects.length === 0) {
    return null;
  }

  const url = new URL(request.url);
  const hostname = url.hostname;
  const pathname = url.pathname;

  for (const redirect of config.redirects) {
    if (shouldApplyRule(redirect, hostname, pathname, request)) {
      const destination = resolveDestination(redirect.destination, url);

      // Skip redirect if already at destination URL
      if (request.url === destination) {
        continue;
      }

      const headers = createHeaders(undefined, { Location: destination });

      if (redirect.response?.headers) {
        Object.entries(redirect.response.headers).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }
      
      const response = new Response(null, {
        status: redirect.statusCode || 302,
        headers: headers
      });
      
      console.log(`Redirecting ${url.href} -> ${destination} (${redirect.statusCode || 301})`);
      
      return response;
    }
  }
  
  return null;
}
