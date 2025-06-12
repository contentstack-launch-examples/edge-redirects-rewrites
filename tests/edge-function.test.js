import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockProcessRedirects = vi.fn();
const mockProcessRewrites = vi.fn();

vi.mock('../lib/redirects.js', () => ({
  processRedirects: mockProcessRedirects
}));

vi.mock('../lib/rewrites.js', () => ({
  processRewrites: mockProcessRewrites
}));

vi.mock('../lib/config.js', () => ({
  redirectsConfig: {
    redirects: [
      {
        source: { host: 'example.com', path: '/test' },
        destination: '/new-test',
        statusCode: 301
      }
    ],
    rewrites: [
      {
        source: { host: 'example.com', path: '/api/test' },
        destination: 'https://backend.com/test'
      }
    ]
  }
}));

describe('Edge Function Handler', () => {
  let mockRequest;
  let mockContext;
  let handler;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Reset mock functions
    mockProcessRedirects.mockReturnValue(null);
    mockProcessRewrites.mockResolvedValue(null);
    
    const module = await import('../functions/[proxy].edge.js');
    handler = module.default;

    global.fetch = vi.fn();

    mockRequest = {
      url: 'https://example.com/test',
      method: 'GET',
      headers: new Map([
        ['user-agent', 'Mozilla/5.0'],
        ['accept', 'text/html']
      ])
    };

    mockContext = {
      geo: { country: 'US' },
      env: { ENVIRONMENT: 'production' }
    };
  });

  it('should return redirect response when redirect is found', async () => {
    const mockRedirectResponse = {
      status: 301,
      url: 'https://example.com/new-test'
    };

    mockProcessRedirects.mockReturnValue(mockRedirectResponse);

    const result = await handler(mockRequest, mockContext);

    expect(result).toBe(mockRedirectResponse);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should forward to origin when no redirect is found', async () => {
    const mockOriginResponse = {
      status: 200,
      body: 'Original content'
    };

    mockProcessRedirects.mockReturnValue(null);
    global.fetch.mockResolvedValue(mockOriginResponse);

    const result = await handler(mockRequest, mockContext);

    expect(global.fetch).toHaveBeenCalledWith(mockRequest);
    expect(result).toBe(mockOriginResponse);
  });
});
