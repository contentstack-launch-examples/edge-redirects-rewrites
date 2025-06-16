const HOSTS = {
  PRIMARY: 'edge-redirects-rewrites.contentstackapps.com',
  SOURCE_DOMAIN: 'source-domain.com',
  API_SOURCE_1: 'api.source-domain-1.com',
  SUB_EXAMPLE: 'sub.example.com',
  DESTINATION: 'destination-domain.com',
  API_DESTINATION: 'api.destination-domain.com',
  CDN_EXAMPLE: 'cdn.example.com',
  EXAMPLE: 'example.com',
  API_BACKEND: 'api.backend.com',
  STORAGE: 'storage.example.com'
};

export const redirectsConfig = {
  redirects: [
    {
      source: {
        host: HOSTS.SOURCE_DOMAIN,
        path: "/old-page"
      },
      destination: `https://${HOSTS.DESTINATION}/new-page`,
      statusCode: 301,
      conditions: {
        headers: {
          "user-agent": "mobile"
        }
      },
      response: {
        headers: {
          "Cache-Control": "public, max-age=31536000",
          "X-Redirect-Reason": "Domain Migration"
        }
      }
    },
    {
      source: {
        host: HOSTS.PRIMARY,
        path: "/old-blog/post-1"
      },
      destination: "/blog/post-1",
      statusCode: 301,
      conditions: {
        headers: {
          accept: "text/html"
        }
      },
      response: {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "X-Redirect-Reason": "URL Structure Change"
        }
      }
    },
    {
      source: {
        host: HOSTS.SUB_EXAMPLE,
        path: "/legacy/old-feature"
      },
      destination: "/new/old-feature",
      statusCode: 302,
      conditions: {
        query: {
          migrate: "true"
        },
        headers: {
          referer: "internal"
        }
      },
      response: {
        headers: {
          "Cache-Control": "no-cache",
          "X-Redirect-Reason": "Legacy Path Migration"
        }
      }
    },
    {
      source: {
        host: HOSTS.API_SOURCE_1,
        path: "/v1/users"
      },
      destination: `https://${HOSTS.API_DESTINATION}/v2/users`,
      statusCode: 301,
      conditions: {
        headers: {
          authorization: "Bearer token123",
          "content-type": "application/json"
        }
      },
      response: {
        headers: {
          "Cache-Control": "no-cache",
          "X-API-Version": "2.0",
          "X-Redirect-Reason": "API Version Upgrade"
        }
      }
    }
  ],
  rewrites: [
    {
      source: {
        host: HOSTS.PRIMARY,
        path: "/api/v1/users"
      },
      destination: `https://${HOSTS.API_BACKEND}/users`,
      conditions: {
        headers: {
          authorization: "*"
        }
      },
      response: {
        headers: {
          "X-Rewrite-Source": "Backend API",
          "Cache-Control": "private, no-cache"
        }
      }
    },
    {
      source: {
        host: HOSTS.EXAMPLE,
        path: "/blog/preview"
      },
      destination: "/blog/draft",
      conditions: {
        query: {
          preview: "true"
        },
        headers: {
          authorization: "Bearer preview-token"
        }
      },
      response: {
        headers: {
          "X-Content-Type": "preview",
          "Cache-Control": "no-store"
        }
      }
    },
    {
      source: {
        host: HOSTS.CDN_EXAMPLE,
        path: "/assets/legacy"
      },
      destination: `https://${HOSTS.STORAGE}/new-assets`,
      response: {
        headers: {
          "X-Asset-Source": "Legacy Migration",
          "Cache-Control": "public, max-age=86400"
        }
      }
    }
  ]
};
