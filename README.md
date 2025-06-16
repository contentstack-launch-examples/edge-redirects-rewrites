# Contentstack Launch Edge Functions: Redirects & Rewrites

Edge function implementation for handling **redirects** and **rewrites** with conditional logic, custom headers, and URL routing.

## Features

- **Smart Redirects** - Conditional redirects with custom headers and status codes
- **Transparent Rewrites** - Internal URL rewriting and API proxying
- **Advanced Conditions** - Header/query parameter validation with wildcard support
- **Edge Performance** - Optimized processing with minimal latency

## Configuration

See `lib/config.js` for comprehensive examples of all supported redirect and rewrite types including:
- Cross-domain redirects with custom headers
- Conditional redirects based on user-agent, referer, etc.
- API rewrites with authentication
- Legacy path migrations
- CDN asset proxying

## Quick Start

```bash
npm test
```
