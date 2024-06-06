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

import { App } from "../src/index.ts";

describe("app.getInstallationUrl", () => {
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

  test("throws when response is null", async () => {
    mock.getOnce("path:/app", {
      body: "null",
      headers: { "Content-Type": "application/json" },
    });

    await expect(app.getInstallationUrl()).rejects.toThrow(
      "[@octokit/app] unable to fetch metadata for app",
    );

    expect(mock.done()).toBe(true);
  });

  test("returns correct url", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });

    const url = await app.getInstallationUrl();

    expect(url).toEqual("https://github.com/apps/octokit/installations/new");
    expect(mock.done()).toBe(true);
  });

  test("caches url", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });

    const urls = await Promise.all([
      app.getInstallationUrl(),
      app.getInstallationUrl(),
      app.getInstallationUrl(),
    ]);

    expect(urls).toEqual(
      new Array(3).fill("https://github.com/apps/octokit/installations/new"),
    );
    expect(mock.done()).toBe(true);
  });

  test("does not cache state", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });
    const state = "abc123";

    const urlWithoutState = await app.getInstallationUrl();
    const urlWithState = await app.getInstallationUrl({ state });

    expect(urlWithoutState).toEqual(
      "https://github.com/apps/octokit/installations/new",
    );
    expect(urlWithState).toEqual(
      `https://github.com/apps/octokit/installations/new?state=${state}`,
    );
    expect(mock.done()).toBe(true);
  });

  test("adds the url-encoded state string to the url", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });
    const state = "abc123%/{";

    const url = await app.getInstallationUrl({ state });

    expect(url).toEqual(
      `https://github.com/apps/octokit/installations/new?state=${encodeURIComponent(state)}`,
    );
    expect(mock.done()).toBe(true);
  });

  test("appends /permissions to the url when target_id present", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });
    const target_id = 456;

    const url = await app.getInstallationUrl({ target_id });

    expect(url).toEqual(
      `https://github.com/apps/octokit/installations/new/permissions?target_id=${target_id}`,
    );
    expect(mock.done()).toBe(true);
  });

  test("adds both state and target_id to the url", async () => {
    mock.getOnce("path:/app", {
      html_url: "https://github.com/apps/octokit",
    });
    const state = "abc123";
    const target_id = 456;

    const url = await app.getInstallationUrl({ state, target_id });

    expect(url).toEqual(
      `https://github.com/apps/octokit/installations/new/permissions?target_id=${target_id}&state=${state}`,
    );
    expect(mock.done()).toBe(true);
  });
});
