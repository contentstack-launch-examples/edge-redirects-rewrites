import { describe, it, expect } from 'vitest';
import { processRedirects } from '../lib/redirects.js';
import { shouldApplyRule as shouldApplyRedirect, checkConditions } from '../lib/common.js';

describe('Edge Redirects', () => {
  describe('shouldApplyRedirect', () => {
    it('should return true when host and path match exactly', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/test-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', {});
      expect(result).toBe(true);
    });

    it('should return false when host does not match', () => {
      const redirect = {
        source: {
          host: 'different.com',
          path: '/test-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', {});
      expect(result).toBe(false);
    });

    it('should return false when path does not match', () => {
      const redirect = {
        source: {
          host: 'example.com',
          path: '/different-path'
        }
      };

      const result = shouldApplyRedirect(redirect, 'example.com', '/test-path', {});
      expect(result).toBe(false);
    });
  });

  describe('checkConditions', () => {
    it('should return true when no conditions are specified', () => {
      const result = checkConditions({}, {});
      expect(result).toBe(true);
    });

    it('should validate header conditions correctly', () => {
      const conditions = {
        headers: {
          'user-agent': 'Mozilla/5.0'
        }
      };

      const mockRequest = {
        headers: {
          get: (name) => name === 'user-agent' ? 'Mozilla/5.0' : null
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

      const mockRequest = {
        headers: {
          get: (name) => name === 'user-agent' ? 'Mozilla/5.0' : null
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

      const mockRequest = {
        url: 'https://example.com/test-path'
      };

      // Mock Response constructor and redirect
      global.Response = function(body, init) {
        const response = {
          status: init?.status || 200,
          headers: init?.headers || new Map(),
          body: body
        };
        
        // Extract URL from Location header for redirects
        if (init?.headers && init.headers.get) {
          const location = init.headers.get('location') || init.headers.get('Location');
          if (location) {
            response.url = location;
          }
        }
        
        return response;
      };
      
      global.Response.redirect = (url, status) => ({ url, status });
      
      global.Headers = function(init) {
        const map = new Map();
        if (init) {
          Object.entries(init).forEach(([key, value]) => {
            map.set(key.toLowerCase(), value);
          });
        }
        return {
          set: (key, value) => map.set(key.toLowerCase(), value),
          get: (key) => map.get(key?.toLowerCase()),
          has: (key) => map.has(key?.toLowerCase()),
          entries: () => map.entries()
        };
      };
      global.console = { log: () => {} };

      const result = processRedirects(config, mockRequest);
      expect(result).toBeTruthy();
      expect(result.status).toBe(301);
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

      const mockRequest = {
        url: 'https://example.com/test-path'
      };

      const result = processRedirects(config, mockRequest);
      expect(result).toBe(null);
    });
  });
});
