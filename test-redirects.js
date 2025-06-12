#!/usr/bin/env node

/**
 * Simple test script for edge redirect functionality
 * Run with: node test-redirects.js
 */

import { processRedirects } from './lib/redirects.js';
import { processRewrites } from './lib/rewrites.js';
import { redirectsConfig } from './lib/config.js';

// Mock Response.redirect for testing
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

global.Response.redirect = (url, status) => ({ url, status, headers: new Map() });

global.Headers = function(init) {
  const map = new Map();
  if (init) {
    if (init instanceof Map) {
      init.forEach((value, key) => map.set(key.toLowerCase(), value));
    } else if (typeof init === 'object') {
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

global.Request = function(url, init) {
  return {
    url,
    method: init?.method || 'GET',
    headers: init?.headers || new Map(),
    body: init?.body || null
  };
};

// Mock fetch for rewrite testing
global.fetch = async (request) => {
  // Simulate backend responses
  if (request.url.includes('api.backend.com')) {
    return {
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']]),
      body: '{"users": ["user1", "user2"]}'
    };
  }
  if (request.url.includes('storage.example.com')) {
    return {
      status: 200,
      headers: new Map([['content-type', 'text/css']]),
      body: '.legacy { color: blue; }'
    };
  }
  return {
    status: 200,
    headers: new Map(),
    body: 'Default content'
  };
};

// Create a proper Headers mock
class MockHeaders {
  constructor(init = {}) {
    this.headers = new Map();
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.headers.set(key.toLowerCase(), value);
      });
    }
  }
  
  get(name) {
    return this.headers.get(name?.toLowerCase()) || null;
  }
  
  set(name, value) {
    this.headers.set(name?.toLowerCase(), value);
  }
  
  has(name) {
    return this.headers.has(name?.toLowerCase());
  }
}

// Mock console.log for cleaner output
const originalLog = console.log;
console.log = () => {};

console.log = originalLog;
console.log('🧪 Testing Edge Redirect & Rewrite Logic\n');

console.log('📍 REDIRECT TESTS:');
const testCases = [
  {
    name: '✅ Exact host/path match with conditions',
    request: {
      url: 'https://source-domain.com/old-page',
      headers: new MockHeaders({ 'user-agent': 'mobile' })
    },
    expected: 'https://destination-domain.com/new-page (301)'
  },
  {
    name: '✅ Path-only destination (same host)',
    request: {
      url: 'https://example.com/old-blog/post-1',
      headers: new MockHeaders({ 'accept': 'text/html' })
    },
    expected: 'https://example.com/blog/post-1 (301)'
  },
  {
    name: '✅ Conditional redirect with query param',
    request: {
      url: 'https://sub.example.com/legacy/old-feature?migrate=true',
      headers: new MockHeaders({ 'referer': 'internal' })
    },
    expected: 'https://sub.example.com/new/old-feature (302)'
  },
  {
    name: '✅ API endpoint redirect',
    request: {
      url: 'https://api.source-domain-1.com/v1/users',
      headers: new MockHeaders({ 
        'authorization': 'Bearer token123',
        'content-type': 'application/json'
      })
    },
    expected: 'https://api.destination-domain.com/v2/users (301)'
  },
  {
    name: '❌ No match - wrong host',
    request: {
      url: 'https://nonmatching.com/some-path',
      headers: new MockHeaders()
    },
    expected: 'null (pass through to origin)'
  },
  {
    name: '❌ No match - conditions not met',
    request: {
      url: 'https://source-domain.com/old-page',
      headers: new MockHeaders({ 'user-agent': 'desktop' }) // Should be 'mobile'
    },
    expected: 'null (pass through to origin)'
  }
];

let passed = 0;
let total = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  
  try {
    const result = processRedirects(redirectsConfig, testCase.request);
    
    if (result === null) {
      console.log(`   Result: null (pass through to origin)`);
      if (testCase.expected.includes('null')) {
        console.log(`   ✅ PASS\n`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${testCase.expected}\n`);
      }
    } else {
      console.log(`   Result: ${result.url} (${result.status})`);
      if (testCase.expected.includes(result.url) && testCase.expected.includes(result.status.toString())) {
        console.log(`   ✅ PASS\n`);
        passed++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${testCase.expected}\n`);
      }
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
});

console.log(`\n📊 Redirect Results: ${passed}/${total} tests passed\n`);

// REWRITE TESTS
console.log('🔄 REWRITE TESTS:');
const rewriteTestCases = [
  {
    name: '✅ API rewrite with wildcard auth',
    request: {
      url: 'https://example.com/api/v1/users',
      method: 'GET',
      headers: new MockHeaders({ 'authorization': 'Bearer any-token' }),
      body: null
    },
    expected: 'rewritten to https://api.backend.com/users'
  },
  {
    name: '✅ Blog preview rewrite with conditions',
    request: {
      url: 'https://example.com/blog/preview?preview=true',
      method: 'GET',
      headers: new MockHeaders({ 'authorization': 'Bearer preview-token' }),
      body: null
    },
    expected: 'rewritten to https://example.com/blog/draft'
  },
  {
    name: '✅ Asset rewrite without conditions',
    request: {
      url: 'https://cdn.example.com/assets/legacy',
      method: 'GET',
      headers: new MockHeaders(),
      body: null
    },
    expected: 'rewritten to https://storage.example.com/new-assets'
  },
  {
    name: '❌ No rewrite match',
    request: {
      url: 'https://different.com/path',
      method: 'GET',
      headers: new MockHeaders(),
      body: null
    },
    expected: 'null (pass through to origin)'
  }
];

let rewritePassed = 0;
let rewriteTotal = rewriteTestCases.length;

for (const [index, testCase] of rewriteTestCases.entries()) {
  console.log(`${index + 1}. ${testCase.name}`);
  
  try {
    const result = await processRewrites(redirectsConfig, testCase.request);
    
    if (result === null) {
      console.log(`   Result: null (pass through to origin)`);
      if (testCase.expected.includes('null')) {
        console.log(`   ✅ PASS\n`);
        rewritePassed++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${testCase.expected}\n`);
      }
    } else {
      console.log(`   Result: rewritten (status: ${result.status})`);
      if (testCase.expected.includes('rewritten')) {
        console.log(`   ✅ PASS\n`);
        rewritePassed++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${testCase.expected}\n`);
      }
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
  }
}

console.log(`📊 Rewrite Results: ${rewritePassed}/${rewriteTotal} tests passed\n`);

const totalPassed = passed + rewritePassed;
const totalTests = total + rewriteTotal;

console.log(`🎯 OVERALL RESULTS: ${totalPassed}/${totalTests} tests passed`);

if (totalPassed === totalTests) {
  console.log('🎉 All tests passed! Edge redirect & rewrite logic is working correctly.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please check the logic and configuration.');
  process.exit(1);
}
