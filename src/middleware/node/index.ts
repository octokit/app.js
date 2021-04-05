import { IncomingMessage, ServerResponse } from "http";

import { createNodeMiddleware as oauthNodeMiddleware } from "@octokit/oauth-app";
import { createNodeMiddleware as webhooksNodeMiddleware } from "@octokit/webhooks";

import { App } from "../..";
import { onUnhandledRequestDefault } from "./on-unhandled-request-default";
import { Options } from "../../types";

export type CreateNodeMiddlewareOptions = {
  pathPrefix?: string;
  log?: Options["log"];
  onUnhandledRequest?: (
    request: IncomingMessage,
    response: ServerResponse
  ) => void;
};

function noop() {}

export function createNodeMiddleware(
  app: App,
  {
    pathPrefix = "/api/github",
    onUnhandledRequest = onUnhandledRequestDefault,
    log,
  }: CreateNodeMiddlewareOptions = {}
) {
  const logWithDefaults = Object.assign(
    {
      debug: noop,
      info: noop,
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    },
    log
  );

  return webhooksNodeMiddleware(app.webhooks, {
    path: pathPrefix + "/webhooks",
    log: logWithDefaults,
    onUnhandledRequest: oauthNodeMiddleware(app.oauth, {
      onUnhandledRequest,
      pathPrefix: pathPrefix + "/oauth",
    }),
  });
}
