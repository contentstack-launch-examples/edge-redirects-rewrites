import { describe, it, expect, beforeEach } from 'vitest';
import { processRedirects } from '../lib/redirects.js';
import { shouldApplyRule as shouldApplyRedirect, checkConditions } from '../lib/common.js';

describe('edge-redirects', () => {
  let mockRequest;
  let mockUrl;

  beforeEach(() => {
    mockUrl = new URL('https://example.com/test-path');
    
    const headersMap = new Map([
      ['user-agent', 'Mozilla/5.0'],
      ['accept', 'text/html'],
      ['authorization', 'Bearer token123']
    ]);
    
    mockRequest = {
      url: mockUrl.href,
      headers: {
        get: function(name) {
          return headersMap.get(name.toLowerCase()) || null;
        }
      }
    };
  });

  describe('shouldApplyRedirect', () => {
    it('should return true when host and path match exactly', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/test-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', mockRequest);
      expect(result).toBe(true);
    });

    it('should return false when host does not match', () => {
      const redirect = {
        source: {
          host: 'different.com',
          path: '/test-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', mockRequest);
      expect(result).toBe(false);
    });

    it('should return false when path does not match', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/different-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', mockRequest);
      expect(result).toBe(false);
    });

    it('should check conditions when present', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/test-path'
        },
        conditions: {
          headers: {
            'user-agent': 'Mozilla/5.0'
          }
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', mockRequest);
      expect(result).toBe(true);
    });

    it('should return false when conditions fail', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/test-path'
        },
        conditions: {
          headers: {
            'user-agent': 'different-agent'
          }
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', mockRequest);
      expect(result).toBe(false);
    });
  });

  describe('checkConditions', () => {
    it('should return true when no conditions are specified', () => {
      const result = checkConditions({}, mockRequest);
      expect(result).toBe(true);
    });

    it('should validate header conditions correctly', () => {
      const conditions = {
        headers: {
          'user-agent': 'Mozilla/5.0',
          'accept': 'text/html'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(true);
    });

    it('should return false when header condition fails', () => {
      const conditions = {
        headers: {
          'user-agent': 'different-agent'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(false);
    });

    it('should return false when header is missing', () => {
      const conditions = {
        headers: {
          'missing-header': 'some-value'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(false);
    });

    it('should validate query parameter conditions', () => {
      const testUrl = new URL('https://example.com/test?migrate=true&version=v2');
      const testRequest = {
        ...mockRequest,
        url: testUrl.href
      };

      const conditions = {
        query: {
          'migrate': 'true',
          'version': 'v2'
        }
      };

      const result = checkConditions(conditions, testRequest);
      expect(result).toBe(true);
    });

    it('should return false when query parameter condition fails', () => {
      const testUrl = new URL('https://example.com/test?migrate=false');
      const testRequest = {
        ...mockRequest,
        url: testUrl.href
      };

      const conditions = {
        query: {
          'migrate': 'true'
        }
      };

      const result = checkConditions(conditions, testRequest);
      expect(result).toBe(false);
    });

    it('should return false when query parameter is missing', () => {
      const conditions = {
        query: {
          'missing-param': 'some-value'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(false);
    });
  });

  describe('processRedirects', () => {
    it('should return redirect response for matching rule', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: '/new-path',
            statusCode: 301
          }
        ]
      };

      global.Response = function(body, init) {
        return {
          status: init?.status || 200,
          headers: init?.headers || new Map(),
          body: body
        };
      };
      
      global.Response.redirect = (url, status) => ({
        url,
        status,
        headers: new Map()
      });
      
      global.Headers = function(init) {
        const map = new Map();
        return {
          set: (key, value) => map.set(key, value),
          get: (key) => map.get(key),
          has: (key) => map.has(key)
        };
      };

      global.console = { log: () => {} };

      const result = processRedirects(config, mockRequest);
      expect(result).toBeTruthy();
      expect(result.status).toBe(301);
    });

    it('should use full URL destination as-is', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: 'https://newdomain.com/new-path',
            statusCode: 302
          }
        ]
      };

      global.Response = function(body, init) {
        return {
          status: init?.status || 200,
          headers: init?.headers || new Map(),
          body: body
        };
      };
      
      global.Response.redirect = (url, status) => ({
        url,
        status,
        headers: new Map()
      });
      
      global.Headers = function(init) {
        const map = new Map();
        return {
          set: (key, value) => map.set(key, value),
          get: (key) => map.get(key),
          has: (key) => map.has(key)
        };
      };

      global.console = { log: () => {} };

      const result = processRedirects(config, mockRequest);
      expect(result.status).toBe(302);
    });

    it('should skip redirect when already at destination URL', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: 'https://example.com/test-path',
            statusCode: 301
          }
        ]
      };

      const result = processRedirects(config, mockRequest);
      expect(result).toBeNull();
    });

    it('should skip redirect when relative destination resolves to same URL', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: '/test-path',
            statusCode: 301
          }
        ]
      };

      const result = processRedirects(config, mockRequest);
      expect(result).toBeNull();
    });

    it('should set custom response headers', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: '/new-path',
            statusCode: 301,
            response: {
              headers: {
                'Cache-Control': 'public, max-age=3600',
                'X-Redirect-Reason': 'Test Redirect'
              }
            }
          }
        ]
      };

      const mockHeaders = {};
      global.Response = function(body, init) {
        return {
          status: init?.status || 200,
          headers: init?.headers || mockHeaders,
          body: body
        };
      };
      
      global.Response.redirect = (url, status) => ({
        url,
        status,
        headers: {
          set: function(key, value) {
            mockHeaders[key] = value;
          }
        }
      });
      
      global.Headers = function(init) {
        const headers = {};
        return {
          set: (key, value) => { headers[key] = value; mockHeaders[key] = value; },
          get: (key) => headers[key],
          has: (key) => key in headers
        };
      };

      global.console = { log: () => {} };

      const result = processRedirects(config, mockRequest);
      expect(mockHeaders['Cache-Control']).toBe('public, max-age=3600');
      expect(mockHeaders['X-Redirect-Reason']).toBe('Test Redirect');
    });

    it('should return null when no rules match', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'different.com',
              path: '/different-path'
            },
            destination: '/new-path',
            statusCode: 301
          }
        ]
      };

      const result = processRedirects(config, mockRequest);
      expect(result).toBe(null);
    });

    it('should handle multiple redirects and return first match', () => {
      const config = {
        redirects: [
          {
            source: {
              host: 'different.com',
              path: '/test-path'
            },
            destination: '/wrong-redirect',
            statusCode: 301
          },
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: '/correct-redirect',
            statusCode: 302
          },
          {
            source: {
              host: 'example.com',
              path: '/test-path'
            },
            destination: '/should-not-reach',
            statusCode: 301
          }
        ]
      };

      global.Response = function(body, init) {
        return {
          status: init?.status || 200,
          headers: init?.headers || new Map(),
          body: body
        };
      };
      
      global.Response.redirect = (url, status) => ({
        url,
        status,
        headers: new Map()
      });
      
      global.Headers = function(init) {
        const map = new Map();
        return {
          set: (key, value) => map.set(key, value),
          get: (key) => map.get(key),
          has: (key) => map.has(key)
        };
      };

      global.console = { log: () => {} };

      const result = processRedirects(config, mockRequest);
      expect(result.status).toBe(302);
    });
  });
});
