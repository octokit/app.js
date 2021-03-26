import { App, createNodeMiddleware } from "../src";

describe("smoke", () => {
  it("App", () => {
    expect(App).toBeInstanceOf(Function);
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

  it("App.defaults", () => {
    expect(App.defaults).toBeInstanceOf(Function);
  });

  it("App.VERSION", () => {
    expect(App.VERSION).toEqual("0.0.0-development");
  });

  it("createNodeMiddleware", () => {
    expect(createNodeMiddleware).toBeInstanceOf(Function);
  });
});
