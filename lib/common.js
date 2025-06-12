
export function shouldApplyRule(rule, hostname, pathname, request) {
  if (rule.source.host !== hostname) {
    return false;
  }

  if (rule.source.path !== pathname) {
    return false;
  }

  if (rule.conditions) {
    if (!checkConditions(rule.conditions, request)) {
      return false;
    }
  }
  
  return true;
}

export function checkConditions(conditions, request) {
  if (conditions.headers) {
    for (const [headerName, expectedValue] of Object.entries(conditions.headers)) {
      const headerValue = request.headers.get(headerName.toLowerCase());
      
      // Support wildcard matching with "*"
      if (expectedValue === "*") {
        if (!headerValue) {
          return false;
        }
      } else if (!headerValue || headerValue !== expectedValue) {
        return false;
      }
    }
  }
  
  if (conditions.query) {
    const url = new URL(request.url);
    for (const [queryName, expectedValue] of Object.entries(conditions.query)) {
      const queryValue = url.searchParams.get(queryName);
      if (!queryValue || queryValue !== expectedValue) {
        return false;
      }
    }
  }
  
  return true;
}

export function resolveDestination(destination, requestUrl) {
  if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
    return `${requestUrl.protocol}//${requestUrl.host}${destination}`;
  }
  return destination;
}

export function createHeaders(baseHeaders = new Headers(), customHeaders = {}) {
  const headers = new Headers(baseHeaders);
  
  Object.entries(customHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return headers;
}
