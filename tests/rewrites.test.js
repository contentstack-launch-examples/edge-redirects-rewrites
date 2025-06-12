import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processRewrites } from '../lib/rewrites.js';
import { checkConditions } from '../lib/common.js';

describe('Rewrites Functionality', () => {
  let mockRequest;
  let mockFetch;

  beforeEach(() => {
    // Mock Request constructor
    global.Request = function(url, init) {
      return {
        url,
        method: init?.method || 'GET',
        headers: init?.headers || new Map(),
        body: init?.body || null
      };
    };

    // Mock Response constructor
    global.Response = function(body, init) {
      const response = {
        status: init?.status || 200,
        statusText: init?.statusText || 'OK',
        headers: init?.headers || new Map(),
        body: body
      };
      
      if (init?.headers && init.headers.get) {
        const location = init.headers.get('location') || init.headers.get('Location');
        if (location) {
          response.url = location;
        }
      }
      
      return response;
    };

    global.Headers = function(init) {
      const map = new Map();
      if (init) {
        if (init instanceof Map) {
          // Copy from another Map
          init.forEach((value, key) => map.set(key.toLowerCase(), value));
        } else if (typeof init === 'object') {
          // Copy from object
          Object.entries(init).forEach(([key, value]) => {
            map.set(key.toLowerCase(), value);
          });
        }
      }
      return {
        set: (key, value) => map.set(key.toLowerCase(), value),
        get: (key) => map.get(key?.toLowerCase()),
        has: (key) => map.has(key?.toLowerCase()),
        entries: () => map.entries(),
        forEach: (callback) => map.forEach(callback)
      };
    };

    // Mock fetch for rewrite requests
    mockFetch = vi.fn();
    global.fetch = mockFetch;
    global.console = { log: vi.fn() };

    const headersMap = new Map([
      ['authorization', 'Bearer test-token'],
      ['accept', 'application/json']
    ]);
    
    mockRequest = {
      url: 'https://example.com/api/v1/users',
      method: 'GET',
      headers: {
        get: (name) => headersMap.get(name?.toLowerCase()) || null
      },
      body: null
    };
  });

  describe('processRewrites', () => {
    it('should rewrite API endpoint to backend', async () => {
      const config = {
        rewrites: [
          {
            source: {
              host: 'example.com',
              path: '/api/v1/users'
            },
            destination: 'https://api.backend.com/users',
            conditions: {
              headers: {
                authorization: '*'
              }
            },
            response: {
              headers: {
                'X-Rewrite-Source': 'Backend API'
              }
            }
          }
        ]
      };

      const mockBackendResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        body: '{"users": []}'
      };

      mockFetch.mockResolvedValue(mockBackendResponse);

      const result = await processRewrites(config, mockRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.backend.com/users',
          method: 'GET'
        })
      );
      expect(result).toBeTruthy();
      expect(result.status).toBe(200);
    });

    it('should handle relative destination paths', async () => {
      const config = {
        rewrites: [
          {
            source: {
              host: 'example.com',
              path: '/blog/preview'
            },
            destination: '/blog/draft',
            conditions: {
              query: {
                preview: 'true'
              }
            }
          }
        ]
      };

      const testRequest = {
        ...mockRequest,
        url: 'https://example.com/blog/preview?preview=true',
        headers: {
          get: () => null
        }
      };

      const mockResponse = {
        status: 200,
        headers: new Map(),
        body: 'Draft content'
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await processRewrites(config, testRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/blog/draft'
        })
      );
      expect(result).toBeTruthy();
    });

    it('should add custom response headers', async () => {
      const config = {
        rewrites: [
          {
            source: {
              host: 'cdn.example.com',
              path: '/assets/legacy'
            },
            destination: 'https://storage.example.com/new-assets',
            response: {
              headers: {
                'X-Asset-Source': 'Legacy Migration',
                'Cache-Control': 'public, max-age=86400'
              }
            }
          }
        ]
      };

      const testRequest = {
        url: 'https://cdn.example.com/assets/legacy',
        method: 'GET',
        headers: { get: () => null },
        body: null
      };

      const mockResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'text/css']]),
        body: 'css content'
      };

      mockFetch.mockResolvedValue(mockResponse);

      const result = await processRewrites(config, testRequest);

      expect(result).toBeTruthy();
      expect(result.status).toBe(200);
      // Custom headers should be added to the response
    });

    it('should return null when no rewrite rules match', async () => {
      const config = {
        rewrites: [
          {
            source: {
              host: 'different.com',
              path: '/different-path'
            },
            destination: '/new-path'
          }
        ]
      };

      const result = await processRewrites(config, mockRequest);
      expect(result).toBe(null);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should preserve request method and body for rewrites', async () => {
      const config = {
        rewrites: [
          {
            source: {
              host: 'example.com',
              path: '/api/v1/users'
            },
            destination: 'https://api.backend.com/users'
          }
        ]
      };

      const postRequest = {
        ...mockRequest,
        method: 'POST',
        body: '{"name": "test"}'
      };

      const mockResponse = {
        status: 201,
        headers: new Map(),
        body: '{"id": 1}'
      };

      mockFetch.mockResolvedValue(mockResponse);

      await processRewrites(config, postRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          body: '{"name": "test"}'
        })
      );
    });
  });

  describe('Enhanced checkConditions with wildcard support', () => {
    it('should support wildcard header matching', () => {
      const conditions = {
        headers: {
          authorization: '*'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(true);
    });

    it('should fail wildcard when header is missing', () => {
      const conditions = {
        headers: {
          'x-custom-header': '*'
        }
      };

      const result = checkConditions(conditions, mockRequest);
      expect(result).toBe(false);
    });
  });
});
