import { Octokit } from "@octokit/core";
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

import { App } from "../src";

describe("app.eachRepository", () => {
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
    });
  });

  test("app.eachRepository(callback)", async () => {
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
      });

    let counter = 0;
    await app.eachRepository(async ({ octokit, repository }) => {
      const { token } = (await octokit.auth({ type: "installation" })) as {
        token: string;
      };
      expect(token).toEqual("secret123");
      expect(repository).toStrictEqual(
        expect.objectContaining({
          owner: {
            login: "octokit",
          },
          name: "app.js",
        })
      );
      counter++;
    });
    expect(counter).toEqual(1);
  });

  test("app.eachRepository({ installationId }, callback)", async () => {
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
      });

    let counter = 0;
    await app.eachRepository(
      { installationId: 123 },
      async ({ octokit, repository }) => {
        const { token } = (await octokit.auth({ type: "installation" })) as {
          token: string;
        };
        expect(token).toEqual("secret123");
        expect(repository).toStrictEqual(
          expect.objectContaining({
            owner: {
              login: "octokit",
            },
            name: "app.js",
          })
        );
        counter++;
      }
    );
    expect(counter).toEqual(1);
  });
});

describe("app.eachRepository.iterator", () => {
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
    });
  });

  test("app.eachRepository.iterator()", async () => {
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
            name: "octokit.js",
            full_name: "octokit/octokit.js",
          },
        ],
      })
      .postOnce("path:/repos/octokit/octokit.js/dispatches", 204, {
        body: { event_type: "my_event", client_payload: { foo: "bar" } },
      });

    for await (const { octokit, repository } of app.eachRepository.iterator()) {
      // https://docs.github.com/en/rest/reference/repos#create-a-repository-dispatch-event
      await octokit.request("POST /repos/{owner}/{repo}/dispatches", {
        owner: repository.owner.login,
        repo: repository.name,
        event_type: "my_event",
        client_payload: {
          foo: "bar",
        },
      });

      expect(repository.full_name).toEqual("octokit/octokit.js");
    }

    expect(mock.done()).toBe(true);
  });
});
