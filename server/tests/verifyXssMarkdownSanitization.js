import express from 'express';
import { createServer } from 'http';
import { sanitizeInput } from '../middleware/securitySanitize.js';
import { sanitizePlainText } from '../../client/src/utils/sanitize.js';

const PORT = 5566;

async function runTests() {
  console.log('--- STARTING XSS & NOSQL INJECTION SANITIZATION INTEGRATION TESTS ---');

  // 1. Verify Client-Side sanitizePlainText utility
  console.log('\nTest 1: Testing client-side sanitizePlainText utility...');
  
  const xssPayloads = [
    { input: '<script>alert("XSS")</script>', expected: 'alert("XSS")' },
    { input: '<img src=x onerror=alert(1)>', expected: '' },
    { input: 'Hello &lt;World&gt;', expected: 'Hello <World>' },
    { input: 'No HTML tags here', expected: 'No HTML tags here' },
    { input: null, expected: '' },
    { input: undefined, expected: '' }
  ];

  for (const { input, expected } of xssPayloads) {
    const result = sanitizePlainText(input);
    console.log(`- Input: ${JSON.stringify(input)} -> Output: ${JSON.stringify(result)}`);
    if (result !== expected) {
      throw new Error(`Client-side sanitization failed! Expected: "${expected}", got: "${result}"`);
    }
  }
  console.log('SUCCESS: Client-side sanitization tests passed.');

  // 2. Set up Express server with backend sanitizeInput middleware
  console.log('\nSetting up test server with sanitizeInput middleware...');
  const app = express();
  app.use(express.json());
  app.use(sanitizeInput);

  app.post('/api/test-sanitize', (req, res) => {
    res.status(200).json({
      success: true,
      body: req.body,
      query: req.query,
      params: req.params
    });
  });

  const server = createServer(app);
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  try {
    // 3. Test NoSQL Operator Injection removal
    console.log('\nTest 2: Requesting backend with NoSQL injection operators...');
    const nosqlPayload = {
      username: { $gt: '' },
      password: 'normal_password',
      nested: {
        '$ne': 'attacker',
        'valid.key': 'should_be_removed_because_of_dot'
      }
    };

    const nosqlRes = await fetch(`http://localhost:${PORT}/api/test-sanitize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nosqlPayload)
    });
    const nosqlBody = await nosqlRes.json();
    console.log(`- Request payload: ${JSON.stringify(nosqlPayload)}`);
    console.log(`- Response body: ${JSON.stringify(nosqlBody.body)}`);

    if (nosqlBody.body.username && typeof nosqlBody.body.username === 'object' && '$gt' in nosqlBody.body.username) {
      throw new Error('NoSQL operator $gt was not stripped from request!');
    }
    if (nosqlBody.body.nested && '$ne' in nosqlBody.body.nested) {
      throw new Error('Nested NoSQL operator $ne was not stripped!');
    }
    if (nosqlBody.body.nested && 'valid.key' in nosqlBody.body.nested) {
      throw new Error('Nested key with dot notation was not stripped!');
    }
    console.log('SUCCESS: NoSQL injection prevention verified.');

    // 4. Test XSS angle bracket stripping on backend
    console.log('\nTest 3: Requesting backend with HTML/XSS payloads...');
    const htmlPayload = {
      bio: 'I am a <script>alert(1)</script> worker & I build cool apps.'
    };

    const htmlRes = await fetch(`http://localhost:${PORT}/api/test-sanitize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(htmlPayload)
    });
    const htmlBody = await htmlRes.json();
    console.log(`- Request bio: ${JSON.stringify(htmlPayload.bio)}`);
    console.log(`- Response bio: ${JSON.stringify(htmlBody.body.bio)}`);

    if (htmlBody.body.bio.includes('<') || htmlBody.body.bio.includes('>')) {
      throw new Error('Angle brackets were not successfully stripped from backend input!');
    }
    console.log('SUCCESS: Backend XSS sanitization verified.');

    console.log('\n=============================================');
    console.log('ALL XSS & NOSQL SANITIZATION TESTS PASSED!');
    console.log('=============================================');

  } catch (error) {
    console.error('\n❌ TEST RUN FAILED:', error);
    process.exit(1);
  } finally {
    server.close(() => {
      console.log('Test server closed.');
      setTimeout(() => {
        process.exit(0);
      }, 100);
    });
  }
}

runTests();
