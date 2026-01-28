import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "1m", target: 100 }, // Ramp up
    { duration: "5m", target: 100 }, // Sustain
    { duration: "1m", target: 500 }, // Peak
    { duration: "2m", target: 500 }, // Sustain peak
    { duration: "1m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // P95 < 500ms
    http_req_failed: ["rate<0.01"], // Error rate < 1%
  },
};

export function setup() {
  // Login with a setup user to get a token
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({
      email: "loadtest@cardkeeper.app",
      password: "Test1234!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(loginRes, { "setup login 200": (r) => r.status === 200 });

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return { token: body.data.accessToken };
  }

  return { token: "" };
}

export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    "Content-Type": "application/json",
  };

  // 1. List cards
  const listRes = http.get(`${BASE_URL}/api/v1/cards?limit=20`, { headers });
  check(listRes, { "list cards 200": (r) => r.status === 200 });

  // 2. Search cards
  const searchRes = http.get(
    `${BASE_URL}/api/v1/cards?search=${encodeURIComponent("김")}&limit=20`,
    { headers }
  );
  check(searchRes, { "search cards 200": (r) => r.status === 200 });

  // 3. List folders
  const foldersRes = http.get(`${BASE_URL}/api/v1/folders`, { headers });
  check(foldersRes, { "list folders 200": (r) => r.status === 200 });

  // 4. List tags
  const tagsRes = http.get(`${BASE_URL}/api/v1/tags`, { headers });
  check(tagsRes, { "list tags 200": (r) => r.status === 200 });

  // 5. Get user profile
  const meRes = http.get(`${BASE_URL}/api/v1/auth/me`, { headers });
  check(meRes, { "get me 200": (r) => r.status === 200 });

  sleep(1);
}

export function teardown() {
  // No cleanup needed
}
