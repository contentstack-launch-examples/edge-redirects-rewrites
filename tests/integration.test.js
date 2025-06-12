import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../functions/[proxy].edge.js';

describe('Integration Tests - Edge Function with Real Config', () => {
  let mockRequest;
  let mockContext;

  beforeEach(() => {
    // Mock global fetch for origin requests
    global.fetch = vi.fn();
    
    // Mock Request constructor for rewrites
    global.Request = function(url, init) {
      return {
        url,
        method: init?.method || 'GET',
        headers: init?.headers || new Map(),
        body: init?.body || null
      };
    };
    
    // Mock Response for redirects and constructors
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
    
    global.Response.redirect = (url, status) => ({
      status,
      url,
      headers: new Map([['location', url]])
    });
    
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

    // Mock console.log
    global.console = { log: vi.fn() };

    mockContext = {
      geo: { country: 'US' },
      env: { ENVIRONMENT: 'production' }
    };
  });

  describe('Redirect Scenarios', () => {
    it('should redirect from source-domain.com to destination domain', async () => {
      mockRequest = {
        url: 'https://source-domain.com/old-page',
        method: 'GET',
        headers: {
          get: function(name) {
            const headers = { 'user-agent': 'mobile' };
            return headers[name.toLowerCase()] || null;
          }
        }
      };

      const result = await handler(mockRequest, mockContext);

      expect(result.status).toBe(301);
      expect(result.url).toBe('https://destination-domain.com/new-page');
    });

    it('should redirect within same domain using path-only destination', async () => {
      const headersMap = new Map([
        ['accept', 'text/html']
      ]);
      mockRequest = {
        url: 'https://example.com/old-blog/post-1',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const result = await handler(mockRequest, mockContext);

      expect(result.status).toBe(301);
      expect(result.url).toBe('https://example.com/blog/post-1');
    });

    it('should apply conditional redirect based on query parameter', async () => {
      const headersMap = new Map([
        ['referer', 'internal']
      ]);
      mockRequest = {
        url: 'https://sub.example.com/legacy/old-feature?migrate=true',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const result = await handler(mockRequest, mockContext);

      expect(result.status).toBe(302);
      expect(result.url).toBe('https://sub.example.com/new/old-feature');
    });

    it('should redirect API endpoint with authorization header', async () => {
      const headersMap = new Map([
        ['authorization', 'Bearer token123'],
        ['content-type', 'application/json']
      ]);
      mockRequest = {
        url: 'https://api.source-domain-1.com/v1/users',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const result = await handler(mockRequest, mockContext);

      expect(result.status).toBe(301);
      expect(result.url).toBe('https://api.destination-domain.com/v2/users');
    });
  });

  describe('Non-matching Scenarios', () => {
    it('should forward to origin when host does not match', async () => {
      const headersMap = new Map([
        ['user-agent', 'Mozilla/5.0']
      ]);
      mockRequest = {
        url: 'https://nonmatching.com/some-path',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 200,
        body: 'Original content'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });

    it('should forward to origin when path does not match', async () => {
      const headersMap = new Map([
        ['accept', 'text/html']
      ]);
      mockRequest = {
        url: 'https://example.com/nonmatching-path',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 200,
        body: 'Original content'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });

    it('should forward to origin when conditions are not met', async () => {
      const headersMap = new Map([
        ['user-agent', 'desktop'] // Should be 'mobile' to match
      ]);
      mockRequest = {
        url: 'https://source-domain.com/old-page',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 200,
        body: 'Original content'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });

    it('should forward to origin when query condition is not met', async () => {
      const headersMap = new Map([
        ['referer', 'internal']
      ]);
      mockRequest = {
        url: 'https://sub.example.com/legacy/old-feature?migrate=false', // Should be 'true'
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 200,
        body: 'Original content'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle POST requests correctly', async () => {
      const headersMap = new Map([
        ['content-type', 'application/json']
      ]);
      mockRequest = {
        url: 'https://nonmatching.com/api/data',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 201,
        body: 'Created'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });

    it('should handle PUT requests correctly', async () => {
      const headersMap = new Map([
        ['content-type', 'application/json']
      ]);
      mockRequest = {
        url: 'https://nonmatching.com/api/data/123',
        method: 'PUT',
        body: JSON.stringify({ data: 'updated' }),
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const mockOriginResponse = {
        status: 200,
        body: 'Updated'
      };
      global.fetch.mockResolvedValue(mockOriginResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(mockRequest);
      expect(result).toBe(mockOriginResponse);
    });

    it('should redirect POST requests when rules match', async () => {
      const headersMap = new Map([
        ['user-agent', 'mobile'],
        ['content-type', 'application/json']
      ]);
      mockRequest = {
        url: 'https://source-domain.com/old-page',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        }
      };

      const result = await handler(mockRequest, mockContext);

      expect(result.status).toBe(301);
      expect(result.url).toBe('https://destination-domain.com/new-page');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('Rewrite Scenarios', () => {
    it('should rewrite API requests to backend', async () => {
      const headersMap = new Map([
        ['authorization', 'Bearer test-token']
      ]);
      mockRequest = {
        url: 'https://example.com/api/v1/users',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        },
        body: null
      };

      const mockBackendResponse = {
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        body: '{"users": []}'
      };

      global.fetch.mockResolvedValue(mockBackendResponse);

      const result = await handler(mockRequest, mockContext);

      // Should call fetch for the rewrite destination
      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://api.backend.com/users'
        })
      );
      expect(result.status).toBe(200);
    });

    it('should rewrite with query conditions', async () => {
      const headersMap = new Map([
        ['authorization', 'Bearer preview-token']
      ]);
      mockRequest = {
        url: 'https://example.com/blog/preview?preview=true',
        method: 'GET',
        headers: {
          get: (name) => headersMap.get(name?.toLowerCase()) || null
        },
        body: null
      };

      const mockResponse = {
        status: 200,
        headers: new Map(),
        body: 'Draft content'
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://example.com/blog/draft'
        })
      );
      expect(result.status).toBe(200);
    });

    it('should handle asset rewrites', async () => {
      mockRequest = {
        url: 'https://cdn.example.com/assets/legacy',
        method: 'GET',
        headers: {
          get: () => null
        },
        body: null
      };

      const mockResponse = {
        status: 200,
        headers: new Map([['content-type', 'text/css']]),
        body: 'css content'
      };

      global.fetch.mockResolvedValue(mockResponse);

      const result = await handler(mockRequest, mockContext);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://storage.example.com/new-assets'
        })
      );
      expect(result.status).toBe(200);
    });
  });
});
