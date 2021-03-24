import { Deprecation } from "deprecation";

import { getNodeMiddleware, App } from "../src";

describe("deprecations", () => {
  test("getNodeMiddleware() - #263", async () => {
    const warn = jest.fn();
    const app = new App({
      appId: "123",
      privateKey: "privateKey",
      oauth: {
        clientId: "123",
        clientSecret: "123secret",
      },
      webhooks: {
        secret: "secret",
      },
      // @ts-expect-error
      log: { warn },
    });

    getNodeMiddleware(app);

    expect(warn).toBeCalledWith(
      new Deprecation(
        "[@octokit/app] getNodeMiddleware is deprecated. Use createNodeMiddleware instead"
      )
    );
  });
});
