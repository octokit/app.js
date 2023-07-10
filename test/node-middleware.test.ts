import { createServer } from "http";

// import without types
const express = require("express");

import { App, createNodeMiddleware } from "../src";

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

describe("createNodeMiddleware()", () => {
  test("unknown route (outside pathPrefix)", async () => {
    const middleware = createNodeMiddleware({} as unknown as App);
    const server = createServer(async (req, res) => {
      if (!(await middleware(req, res))) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Not found.");
        res.end();
      }
    }).listen();
    // @ts-expect-error complains about { port } although it's included in returned AddressInfo interface
    const { port } = server.address();

    const response = await fetch(`http://localhost:${port}/unknown-route`);

    expect(response.status).toEqual(404);
    expect(response.headers.get("Content-Type")).toBe("text/plain");
    await expect(response.text()).resolves.toBe("Not found.");

    server.close();
  });

  test("unknown route (within pathPrefix)", async () => {
    const middleware = createNodeMiddleware({} as unknown as App);
    const server = createServer(async (req, res) => {
      if (!(await middleware(req, res))) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Not found.");
        res.end();
      }
    }).listen();
    // @ts-expect-error complains about { port } although it's included in returned AddressInfo interface
    const { port } = server.address();

    const response = await fetch(
      `http://localhost:${port}/api/github/unknown-route`,
    );

    expect(response.status).toEqual(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({
      error: "Unknown route: GET /api/github/unknown-route",
    });

    server.close();
  });

  test("unknown route (within webhooks path)", async () => {
    const middleware = createNodeMiddleware({} as unknown as App);
    const server = createServer(async (req, res) => {
      if (!(await middleware(req, res))) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Not found.");
        res.end();
      }
    }).listen();
    // @ts-expect-error complains about { port } although it's included in returned AddressInfo interface
    const { port } = server.address();

    const response = await fetch(
      `http://localhost:${port}/api/github/webhooks`,
    );

    expect(response.status).toEqual(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({
      error: "Unknown route: GET /api/github/webhooks",
    });

    server.close();
  });

  test("unknown route (within oauth pathPrefix)", async () => {
    const middleware = createNodeMiddleware({} as unknown as App);
    const server = createServer(async (req, res) => {
      if (!(await middleware(req, res))) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("Not found.");
        res.end();
      }
    }).listen();
    // @ts-expect-error complains about { port } although it's included in returned AddressInfo interface
    const { port } = server.address();

    const response = await fetch(
      `http://localhost:${port}/api/github/oauth/unknown-route`,
    );

    expect(response.status).toEqual(404);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({
      error: "Unknown route: GET /api/github/oauth/unknown-route",
    });

    server.close();
  });

  test("express middleware no mount path 404", async () => {
    const expressApp = express();

    expressApp.use(
      createNodeMiddleware(
        new App({
          appId: APP_ID,
          privateKey: PRIVATE_KEY,
          webhooks: {
            secret: "mysecret",
          },
          oauth: {
            clientId: "",
            clientSecret: "",
          },
        }),
      ),
    );
    expressApp.all("*", (_request: any, response: any) =>
      response.status(404).send("Nope"),
    );

    const server = expressApp.listen();

    const { port } = server.address();

    const response = await fetch(`http://localhost:${port}/test`, {
      method: "POST",
      body: "{}",
    });

    await expect(response.text()).resolves.toBe("Nope");
    expect(response.status).toEqual(404);

    server.close();
  });

  test("express middleware no mount path no next", async () => {
    const app = express();

    app.all("/foo", (_request: any, response: any) => response.end("ok\n"));
    app.use(
      createNodeMiddleware(
        new App({
          appId: APP_ID,
          privateKey: PRIVATE_KEY,
          webhooks: {
            secret: "mysecret",
          },
          oauth: {
            clientId: "",
            clientSecret: "",
          },
        }),
      ),
    );

    const server = app.listen();

    const { port } = server.address();

    const response = await fetch(`http://localhost:${port}/test`, {
      method: "POST",
      body: "{}",
    });

    await expect(response.text()).resolves.toContain("Cannot POST /test");
    expect(response.status).toEqual(404);

    const responseForFoo = await fetch(`http://localhost:${port}/foo`, {
      method: "POST",
      body: "{}",
    });

    await expect(responseForFoo.text()).resolves.toContain("ok\n");
    expect(responseForFoo.status).toEqual(200);

    server.close();
  });

  test("express middleware no mount path with options.pathPrefix", async () => {
    const app = express();

    app.use(
      createNodeMiddleware(
        new App({
          appId: APP_ID,
          privateKey: PRIVATE_KEY,
          webhooks: {
            secret: "mysecret",
          },
          oauth: {
            clientId: "",
            clientSecret: "",
          },
        }),
        { pathPrefix: "/test" },
      ),
    );
    app.all("*", (_request: any, response: any) =>
      response.status(404).send("Nope"),
    );

    const server = app.listen();

    const { port } = server.address();

    const { status } = await fetch(
      `http://localhost:${port}/test/oauth/login`,
      {
        redirect: "manual",
      },
    );

    server.close();

    expect(status).toEqual(302);
  });

  test("express middleware with mount path with options.pathPrefix", async () => {
    const app = express();

    app.use(
      "/test",
      createNodeMiddleware(
        new App({
          appId: APP_ID,
          privateKey: PRIVATE_KEY,
          webhooks: {
            secret: "mysecret",
          },
          oauth: {
            clientId: "",
            clientSecret: "",
          },
        }),
        { pathPrefix: "/test" },
      ),
    );
    app.all("*", (_request: any, response: any) =>
      response.status(404).send("Nope"),
    );

    const server = app.listen();

    const { port } = server.address();

    const { status } = await fetch(
      `http://localhost:${port}/test/test/oauth/login`,
      {
        redirect: "manual",
      },
    );

    server.close();

    expect(status).toEqual(302);
  });
});
