
export function shouldApplyRule(rule, hostname, pathname, request) {
  if (rule.source.host !== hostname) {
    console.log('hostcheck', rule.source.host, hostname, pathname);
    return false;
  }

  if (rule.source.path !== pathname) {
    console.log('pathcheck',  rule.source.host, hostname, rule.source.path, pathname);
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
    console.log('Checking headers');
    for (const [headerName, expectedValue] of Object.entries(conditions.headers)) {
      const headerValue = request.headers.get(headerName.toLowerCase());
      
        console.log('header value', headerName, expectedValue, headerValue);
      // Support wildcard matching with "*"
      if (expectedValue === "*") {
        if (!headerValue) {
          console.log('Wildcard header check failed', headerName);
          return false;
        }
        console.log('Wildcard header check passed', headerName);
      } else if (!headerValue || headerValue !== expectedValue) {
        console.log('Header check failed', headerName, expectedValue, headerValue);
        return false;
      }
      console.log('Header check passed', headerName, expectedValue, headerValue);
    }
  }
  
  if (conditions.query) {
    console.log('Checking query params');
    const url = new URL(request.url);
    for (const [queryName, expectedValue] of Object.entries(conditions.query)) {
      const queryValue = url.searchParams.get(queryName);
      if (!queryValue || queryValue !== expectedValue) {
        console.log('Query param check failed', queryName, expectedValue, queryValue);
        return false;
      }
      console.log('Query param check passed', queryName, expectedValue, queryValue);
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
