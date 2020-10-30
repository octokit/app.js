import { App, getNodeMiddleware } from "../src";

describe("smoke", () => {
  it("App", () => {
    expect(typeof App).toBe('function')
  });

  it("App.VERSION", () => {
    expect(App.VERSION).toEqual('0.0.0-development');
  });

  it("getNodeMiddleware", () => {
    expect(typeof getNodeMiddleware).toBe('function');
  });
});
