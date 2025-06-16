export const redirectsConfig = {
  "redirects": [
    {
      "source": {
        "host": "source-domain.com",
        "path": "/old-page"
      },
      "destination": "https://destination-domain.com/new-page",
      "statusCode": 301,
      "conditions": {
        "headers": {
          "user-agent": "mobile"
        }
      },
      "response": {
        "headers": {
          "Cache-Control": "public, max-age=31536000",
          "X-Redirect-Reason": "Domain Migration"
        }
      }
    },
    {
      "source": {
        "host": "edge-redirects-rewrites.contentstackapps.com",
        "path": "/old-blog/post-1"
      },
      "destination": "/blog/post-1",
      "statusCode": 301,
      "conditions": {
        "headers": {
          "accept": "text/html"
        }
      },
      "response": {
        "headers": {
          "Cache-Control": "public, max-age=3600",
          "X-Redirect-Reason": "URL Structure Change"
        }
      }
    },
    {
      "source": {
        "host": "sub.example.com",
        "path": "/legacy/old-feature"
      },
      "destination": "/new/old-feature",
      "statusCode": 302,
      "conditions": {
        "query": {
          "migrate": "true"
        },
        "headers": {
          "referer": "internal"
        }
      },
      "response": {
        "headers": {
          "Cache-Control": "no-cache",
          "X-Redirect-Reason": "Legacy Path Migration"
        }
      }
    },
    {
      "source": {
        "host": "api.source-domain-1.com",
        "path": "/v1/users"
      },
      "destination": "https://api.destination-domain.com/v2/users",
      "statusCode": 301,
      "conditions": {
        "headers": {
          "authorization": "Bearer token123",
          "content-type": "application/json"
        }
      },
      "response": {
        "headers": {
          "Cache-Control": "no-cache",
          "X-API-Version": "2.0",
          "X-Redirect-Reason": "API Version Upgrade"
        }
      }
    }
  ],
  "rewrites": [
    {
      "source": {
        "host": "edge-redirects-rewrites.contentstackapps.com",
        "path": "/api/v1/users"
      },
      "destination": "edge-redirects-rewrites.contentstackapps.com/",
      "conditions": {
        "headers": {
          "authorization": "*"
        }
      },
      "response": {
        "headers": {
          "X-Rewrite-Source": "Backend API",
          "Cache-Control": "private, no-cache"
        }
      }
    },
    {
      "source": {
        "host": "example.com",
        "path": "/blog/preview"
      },
      "destination": "/blog/draft",
      "conditions": {
        "query": {
          "preview": "true"
        },
        "headers": {
          "authorization": "Bearer preview-token"
        }
      },
      "response": {
        "headers": {
          "X-Content-Type": "preview",
          "Cache-Control": "no-store"
        }
      }
    },
    {
      "source": {
        "host": "cdn.example.com",
        "path": "/assets/legacy"
      },
      "destination": "https://storage.example.com/new-assets",
      "response": {
        "headers": {
          "X-Asset-Source": "Legacy Migration",
          "Cache-Control": "public, max-age=86400"
        }
      }
    }
  ]
};
