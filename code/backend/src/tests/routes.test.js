import { beforeAll, describe, expect, expectTypeOf, test } from "vitest";

const BEFORE_ALL_TIMEOUT = 30000; // 30 sec

describe("test que le code renvoie 404 quand on accede a une route qui existe pas", () => {
  let response;
  let body;
  const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000'

  beforeAll(async () => {
    response = await fetch(`${BASE}/api/1234`);
    body = await response.json();
  }, BEFORE_ALL_TIMEOUT);

  test("Aurait du renvoier 404", () => {
    expect(response.status).toBe(404);
  });
});
