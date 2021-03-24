import { App, createNodeMiddleware } from "../src";

describe("smoke", () => {
  it("App", () => {
    expect(typeof App).toBe("function");
  });

  it("new App(options)", () => {
    new App({
      appId: "123",
      privateKey: "privateKey",
      oauth: {
        clientId: "123",
        clientSecret: "123secret",
      },
      webhooks: {
        secret: "secret",
      },
    });
  });

  it("App.VERSION", () => {
    expect(App.VERSION).toEqual("0.0.0-development");
  });

  it("createNodeMiddleware", () => {
    expect(typeof createNodeMiddleware).toBe("function");
  });
});
