import { createServer } from "http";

import { Octokit } from "@octokit/core";
import { request } from "@octokit/request";
import fetchMock from "fetch-mock";
import MockDate from "mockdate";

const APP_ID = 1;
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1c7+9z5Pad7OejecsQ0bu3aozN3tihPmljnnudb9G3HECdnH
lWu2/a1gB9JW5TBQ+AVpum9Okx7KfqkfBKL9mcHgSL0yWMdjMfNOqNtrQqKlN4kE
p6RD++7sGbzbfZ9arwrlD/HSDAWGdGGJTSOBM6pHehyLmSC3DJoR/CTu0vTGTWXQ
rO64Z8tyXQPtVPb/YXrcUhbBp8i72b9Xky0fD6PkEebOy0Ip58XVAn2UPNlNOSPS
ye+Qjtius0Md4Nie4+X8kwVI2Qjk3dSm0sw/720KJkdVDmrayeljtKBx6AtNQsSX
gzQbeMmiqFFkwrG1+zx6E7H7jqIQ9B6bvWKXGwIDAQABAoIBAD8kBBPL6PPhAqUB
K1r1/gycfDkUCQRP4DbZHt+458JlFHm8QL6VstKzkrp8mYDRhffY0WJnYJL98tr4
4tohsDbqFGwmw2mIaHjl24LuWXyyP4xpAGDpl9IcusjXBxLQLp2m4AKXbWpzb0OL
Ulrfc1ZooPck2uz7xlMIZOtLlOPjLz2DuejVe24JcwwHzrQWKOfA11R/9e50DVse
hnSH/w46Q763y4I0E3BIoUMsolEKzh2ydAAyzkgabGQBUuamZotNfvJoDXeCi1LD
8yNCWyTlYpJZJDDXooBU5EAsCvhN1sSRoaXWrlMSDB7r/E+aQyKua4KONqvmoJuC
21vSKeECgYEA7yW6wBkVoNhgXnk8XSZv3W+Q0xtdVpidJeNGBWnczlZrummt4xw3
xs6zV+rGUDy59yDkKwBKjMMa42Mni7T9Fx8+EKUuhVK3PVQyajoyQqFwT1GORJNz
c/eYQ6VYOCSC8OyZmsBM2p+0D4FF2/abwSPMmy0NgyFLCUFVc3OECpkCgYEA5OAm
I3wt5s+clg18qS7BKR2DuOFWrzNVcHYXhjx8vOSWV033Oy3yvdUBAhu9A1LUqpwy
Ma+unIgxmvmUMQEdyHQMcgBsVs10dR/g2xGjMLcwj6kn+xr3JVIZnbRT50YuPhf+
ns1ScdhP6upo9I0/sRsIuN96Gb65JJx94gQ4k9MCgYBO5V6gA2aMQvZAFLUicgzT
u/vGea+oYv7tQfaW0J8E/6PYwwaX93Y7Q3QNXCoCzJX5fsNnoFf36mIThGHGiHY6
y5bZPPWFDI3hUMa1Hu/35XS85kYOP6sGJjf4kTLyirEcNKJUWH7CXY+00cwvTkOC
S4Iz64Aas8AilIhRZ1m3eQKBgQCUW1s9azQRxgeZGFrzC3R340LL530aCeta/6FW
CQVOJ9nv84DLYohTVqvVowdNDTb+9Epw/JDxtDJ7Y0YU0cVtdxPOHcocJgdUGHrX
ZcJjRIt8w8g/s4X6MhKasBYm9s3owALzCuJjGzUKcDHiO2DKu1xXAb0SzRcTzUCn
7daCswKBgQDOYPZ2JGmhibqKjjLFm0qzpcQ6RPvPK1/7g0NInmjPMebP0K6eSPx0
9/49J6WTD++EajN7FhktUSYxukdWaCocAQJTDNYP0K88G4rtC2IYy5JFn9SWz5oh
x//0u+zd/R/QRUzLOw4N72/Hu+UG6MNt5iDZFCtapRaKt6OvSBwy8w==
-----END RSA PRIVATE KEY-----`;
const CLIENT_ID = "0123";
const CLIENT_SECRET = "0123secret";
const WEBHOOK_SECRET = "secret";
// see https://runkit.com/gr2m/reproducable-jwt
const BEARER =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOi0zMCwiZXhwIjo1NzAsImlzcyI6MX0.q3foRa78U3WegM5PrWLEh5N0bH1SD62OqW66ZYzArp95JBNiCbo8KAlGtiRENCIfBZT9ibDUWy82cI4g3F09mdTq3bD1xLavIfmTksIQCz5EymTWR5v6gL14LSmQdWY9lSqkgUG0XCFljWUglEP39H4yeHbFgdjvAYg3ifDS12z9oQz2ACdSpvxPiTuCC804HkPVw8Qoy0OSXvCkFU70l7VXCVUxnuhHnk8-oCGcKUspmeP6UdDnXk-Aus-eGwDfJbU2WritxxaXw6B4a3flTPojkYLSkPBr6Pi0H2-mBsW_Nvs0aLPVLKobQd4gqTkosX3967DoAG8luUMhrnxe8Q";

import { App, createNodeMiddleware } from "../src";

describe("README examples", () => {
  let app: InstanceType<typeof App>;
  let mock: typeof fetchMock;

  beforeEach(() => {
    MockDate.set(0);
    mock = fetchMock.sandbox();

    app = new App({
      appId: APP_ID,
      privateKey: PRIVATE_KEY,
      oauth: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      webhooks: {
        secret: WEBHOOK_SECRET,
      },
      Octokit: Octokit.defaults({
        request: {
          fetch: mock,
        },
      }),
      log: console,
    });
  });

  test("App.defaults()", async () => {
    const MyApp = App.defaults({
      Octokit: Octokit.plugin((octokit) =>
        octokit.hook.wrap("request", () => ({
          data: { ok: true },
          headers: {},
          status: 1,
          url: "",
        }))
      ),
    });

    const app = new MyApp({
      appId: APP_ID,
      privateKey: PRIVATE_KEY,
    });

    const { data } = await app.octokit.request("GET /");
    expect(data).toStrictEqual({ ok: true });
  });

  test("app.octokit.request", async () => {
    mock.getOnce(
      "path:/app",
      {
        name: "My App",
      },
      {
        headers: {
          authorization: `bearer ${BEARER}`,
        },
      }
    );

    const { data } = await app.octokit.request("/app");
    expect(data.name).toEqual("My App");
  });

  test("app.eachRepository.iterator", async () => {
    mock
      .getOnce(
        "path:/app/installations",
        [
          {
            id: "123",
          },
        ],
        {
          headers: {
            authorization: `bearer ${BEARER}`,
          },
        }
      )
      .postOnce(
        "path:/app/installations/123/access_tokens",
        {
          token: "secret123",
          expires_at: "1970-01-01T01:00:00.000Z",
          permissions: {
            metadata: "read",
          },
          repository_selection: "all",
        },
        {
          headers: {
            authorization: `bearer ${BEARER}`,
          },
        }
      )
      .getOnce("path:/installation/repositories", {
        total_count: 1,
        repositories: [
          {
            owner: {
              login: "octokit",
            },
            name: "app.js",
          },
        ],
      })
      .postOnce(
        "path:/repos/octokit/app.js/dispatches",
        {
          ok: true,
        },
        {
          body: {
            event_type: "my_event",
          },
        }
      );

    for await (const { octokit, repository } of app.eachRepository.iterator()) {
      await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
        owner: repository.owner.login,
        repo: repository.name,
        event_type: "my_event",
      });
    }
  });

  test('app.webhooks.on("issues.opened", handler)', async () => {
    mock
      .postOnce(
        "path:/app/installations/123/access_tokens",
        {
          token: "secret123",
          expires_at: "1970-01-01T01:00:00.000Z",
          permissions: {
            metadata: "read",
          },
          repository_selection: "all",
        },
        {
          headers: {
            authorization: `bearer ${BEARER}`,
          },
        }
      )
      .postOnce(
        "path:/repos/octokit/app.js/issues/456/comments",
        {
          ok: true,
        },
        {
          body: {
            body: "Hello World!",
          },
        }
      );

    app.webhooks.on("issues.opened", async ({ octokit, payload }) => {
      await octokit.request(
        "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
        {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          issue_number: payload.issue.number,
          body: "Hello World!",
        }
      );
    });

    const middleware = createNodeMiddleware(app);

    const server = createServer(middleware).listen().unref();

    // @ts-ignore
    const { port } = server.address();
    const url = `http://localhost:${port}/api/github/webhooks`;
    const data = {
      action: "opened",
      installation: {
        id: 123,
      },
      repository: {
        owner: {
          login: "octokit",
        },
        name: "app.js",
      },
      issue: {
        number: 456,
      },
    };

    await request({
      method: "POST",
      url,
      headers: {
        "x-github-event": "issues",
        "x-github-delivery": "event-id-123",
        "x-hub-signature-256": await app.webhooks.sign(data),
      },
      data,
    }).catch(console.error);

    server.close();

    expect(mock.done()).toBe(true);
  });

  test('app.oauth.on("token", handler)', async () => {
    expect.assertions(2);

    mock
      .postOnce(
        "https://github.com/login/oauth/access_token",
        {
          access_token: "secret123",
          scope: "",
          token_type: "bearer",
        },
        {
          body: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            code: "code123",
          },
        }
      )
      .getOnce(
        "path:/user",
        { id: 1 },
        {
          headers: {
            authorization: `token secret123`,
          },
        }
      );

    app.oauth.on("token", async ({ octokit }) => {
      const { data } = await octokit.request("GET /user");
      expect(data.id).toEqual(1);
    });

    const middleware = createNodeMiddleware(app);

    const server = createServer(middleware).listen().unref();

    // @ts-ignore
    const { port } = server.address();

    await request(`http://localhost:${port}/api/github/oauth/callback`, {
      code: "code123",
      state: "state123",
    }).catch(console.error);

    server.close();

    expect(mock.done()).toBe(true);
  });
});
