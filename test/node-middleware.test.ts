import { createServer } from "http";
import fetch from "node-fetch";

import { App, createNodeMiddleware } from "../src";

describe("createNodeMiddleware()", () => {
  test("unknown route", async () => {
    const app = new App({
      appId: 123,
      privateKey: "",
      webhooks: {
        secret: "mysecret",
      },
      oauth: {
        clientId: "",
        clientSecret: "",
      },
    });

    const server = createServer(createNodeMiddleware(app)).listen();
    // @ts-expect-error complains about { port } although it's included in returned AddressInfo interface
    const { port } = server.address();

    const response = await fetch(`http://localhost:${port}/unknown-route`);

    expect(response.status).toEqual(404);
    await expect(response.text()).resolves.toMatch(
      /Unknown route: GET \/unknown-route/
    );

    server.close();
  });
});
