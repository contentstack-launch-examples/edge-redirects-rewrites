# Edge Redirects & Rewrites

A production-ready Next.js application demonstrating **Contentstack Launch Edge Functions** for handling both **redirects** and **rewrites** on Cloudflare Workers. This implementation provides advanced URL routing with conditional logic, custom headers, and comprehensive testing.

## ✨ Features

### 🔄 **Redirects** 
- **Exact host/path matching** for precise control
- **Conditional redirects** based on headers and query parameters  
- **Custom response headers** (Cache-Control, tracking headers)
- **Multiple status codes** (301, 302, etc.)
- **Path-only destinations** for same-host redirects
- **Header case-insensitive matching** (follows HTTP spec)

### ↩️ **Rewrites** *(NEW)*
- **Internal URL rewriting** without changing browser URL
- **Backend API proxy** functionality  
- **Conditional rewrites** with header/query validation
- **Custom response headers** modification
- **HTTP method preservation** (GET, POST, PUT, etc.)
- **Request body forwarding** for API proxying
- **Wildcard header matching** (`"authorization": "*"`)

### 🎛️ **Advanced Conditions**
- **Header validation** with exact match or wildcard (`*`)
- **Query parameter matching** 
- **Multiple condition combinations** (AND logic)
- **Case-insensitive header handling**

## 📋 Configuration Examples

### Redirect Configuration
```javascript
{
  "redirects": [
    {
      "source": {
        "host": "old-domain.com", 
        "path": "/legacy-page"
      },
      "destination": "https://new-domain.com/new-page",
      "statusCode": 301,
      "conditions": {
        "headers": {
          "user-agent": "mobile"  // Exact match
        },
        "query": {
          "migrate": "true"  // Must have ?migrate=true
        }
      },
      "response": {
        "headers": {
          "Cache-Control": "public, max-age=31536000",
          "X-Redirect-Reason": "Domain Migration"
        }
      }
    }
  ]
}
```

### Rewrite Configuration  
```javascript
{
  "rewrites": [
    {
      "source": {
        "host": "example.com",
        "path": "/api/v1/users"
      },
      "destination": "https://api.backend.com/users",
      "conditions": {
        "headers": {
          "authorization": "*"  // Any authorization header
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
        "host": "cdn.example.com",
        "path": "/assets/legacy"
      },
      "destination": "https://storage.example.com/new-assets"
      // No conditions = always rewrite
    }
  ]
}
```

## 🎯 How It Works

### Processing Order
1. **Redirects first** - Check all redirect rules
2. **Rewrites second** - Check rewrite rules if no redirect matches  
3. **Origin fallback** - Forward to original server if no rules match

### Redirect vs Rewrite
- **Redirect**: Returns 301/302 status, browser navigates to new URL
- **Rewrite**: Returns 200 status, fetches content from different URL while keeping original URL in browser

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the Next.js app.

### Testing
```bash
# Run all tests (48 tests)
npm test

# Run tests with coverage
npm run test:coverage  
```

### Build
```bash
npm run build
```

## ⚙️ Configuration Details

### Source Matching
```javascript
"source": {
  "host": "example.com",     // Exact hostname match
  "path": "/api/users"       // Exact path match  
}
```

### Destination Options
```javascript
// Full URL (cross-domain)
"destination": "https://api.backend.com/users"

// Path only (same host)  
"destination": "/new-path"
```

### Condition Types
```javascript
"conditions": {
  "headers": {
    "authorization": "*",           // Wildcard: any value
    "user-agent": "mobile",        // Exact match
    "content-type": "application/json"
  },
  "query": {
    "preview": "true",             // Must equal "true"
    "version": "v2"                // Multiple conditions (AND)
  }
}
```

### Response Headers
```javascript
"response": {
  "headers": {
    "Cache-Control": "public, max-age=3600",
    "X-Custom-Header": "value",
    "X-Redirect-Reason": "Migration"
  }
}
```

## 📄 License

MIT License - see LICENSE file for details.
