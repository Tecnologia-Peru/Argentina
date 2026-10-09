const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createServer } = require('../src/server');

const server = createServer();
let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('GET /health returns the service status', async () => {
  const response = await fetch(`${baseUrl}/health`);

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('unknown routes return 404', async () => {
  const response = await fetch(`${baseUrl}/unknown`);

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not found' });
});
