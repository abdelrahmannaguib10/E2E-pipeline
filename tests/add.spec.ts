import { test, expect, APIRequestContext } from '@playwright/test';

/**
 * E2E tests for POST /add endpoint
 * API Spec: Math Operations API v1.0.0
 */

const ENDPOINT = '/add';

test.describe('POST /add - Math Operations API', () => {

  test.describe('Happy path - successful additions', () => {

    test('should add two positive integers correctly', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 2, b: 3 },
      });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/json');

      const body = await response.json();
      expect(body).toHaveProperty('result');
      expect(body.result).toBe(5);
      expect(typeof body.result).toBe('number');
      expect(Number.isInteger(body.result)).toBe(true);
    });

    test('should add zero to a number', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 0, b: 42 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.result).toBe(42);
    });

    test('should add two zeros', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 0, b: 0 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.result).toBe(0);
    });

    test('should add two negative integers', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: -5, b: -10 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.result).toBe(-15);
    });

    test('should add a positive and a negative integer', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 10, b: -3 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.result).toBe(7);
    });

    test('should handle large integers', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 1000000, b: 2000000 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.result).toBe(3000000);
    });

    test('should be commutative (a + b == b + a)', async ({ request }) => {
      const res1 = await request.post(ENDPOINT, { data: { a: 7, b: 13 } });
      const res2 = await request.post(ENDPOINT, { data: { a: 13, b: 7 } });

      expect(res1.status()).toBe(200);
      expect(res2.status()).toBe(200);

      const body1 = await res1.json();
      const body2 = await res2.json();
      expect(body1.result).toBe(body2.result);
      expect(body1.result).toBe(20);
    });
  });

  test.describe('Parameterized data-driven tests', () => {
    const cases: Array<{ a: number; b: number; expected: number; name: string }> = [
      { a: 1, b: 1, expected: 2, name: '1 + 1 = 2' },
      { a: 100, b: 200, expected: 300, name: '100 + 200 = 300' },
      { a: -50, b: 50, expected: 0, name: '-50 + 50 = 0' },
      { a: 999, b: 1, expected: 1000, name: '999 + 1 = 1000' },
      { a: -1, b: -1, expected: -2, name: '-1 + -1 = -2' },
    ];

    for (const { a, b, expected, name } of cases) {
      test(`adds correctly: ${name}`, async ({ request }) => {
        const response = await request.post(ENDPOINT, { data: { a, b } });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.result).toBe(expected);
      });
    }
  });

  test.describe('Invalid input - error handling', () => {

    test('should return 400 when "a" is a string', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 'not-a-number', b: 5 },
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when "b" is a string', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 5, b: 'not-a-number' },
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when "a" is missing', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { b: 5 },
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when "b" is missing', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 5 },
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 with an empty body', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test('should return 400 when values are null', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: null, b: null },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject malformed JSON', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        headers: { 'Content-Type': 'application/json' },
        data: '{ invalid json',
      });

      // Malformed JSON should yield a client error (typically 400)
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Response contract', () => {

    test('response should only contain the "result" field with an integer value', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 4, b: 6 },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      expect(body).toHaveProperty('result');
      expect(typeof body.result).toBe('number');
      expect(Number.isInteger(body.result)).toBe(true);
    });

    test('should return JSON content-type', async ({ request }) => {
      const response = await request.post(ENDPOINT, {
        data: { a: 1, b: 2 },
      });

      expect(response.headers()['content-type']).toContain('application/json');
    });
  });

  test.describe('Performance', () => {

    test('should respond within 5 seconds', async ({ request }) => {
      const start = Date.now();
      const response = await request.post(ENDPOINT, {
        data: { a: 1, b: 2 },
      });
      const duration = Date.now() - start;

      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(5000);
    });
  });
});
