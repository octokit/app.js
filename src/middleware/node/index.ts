// remove type imports from http for Deno compatibility
// see https://github.com/octokit/octokit.js/issues/24#issuecomment-817361886
// import { IncomingMessage, ServerResponse } from "http";
type IncomingMessage = any;
type ServerResponse = any;

import { createNodeMiddleware as oauthNodeMiddleware } from "@octokit/oauth-app";
import { createNodeMiddleware as webhooksNodeMiddleware } from "@octokit/webhooks";

import { App } from "../../index";
import { onUnhandledRequestDefault } from "./on-unhandled-request-default";
import { Options } from "../../types";

export type MiddlewareOptions = {
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
  options: MiddlewareOptions = {}
) {
  const log = Object.assign(
    {
      debug: noop,
      info: noop,
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    },
    options.log
  );

  const optionsWithDefaults = {
    onUnhandledRequest: onUnhandledRequestDefault,
    pathPrefix: "/api/github",
    ...options,
    log,
  };

  const webhooksMiddleware = webhooksNodeMiddleware(app.webhooks, {
    path: optionsWithDefaults.pathPrefix + "/webhooks",
    log,
    onUnhandledRequest: optionsWithDefaults.onUnhandledRequest,
  });

  const oauthMiddleware = oauthNodeMiddleware(app.oauth, {
    pathPrefix: optionsWithDefaults.pathPrefix + "/oauth",
    onUnhandledRequest: optionsWithDefaults.onUnhandledRequest,
  });

  return middleware.bind(null, optionsWithDefaults, {
    webhooksMiddleware,
    oauthMiddleware,
  });
}

export async function middleware(
  options: Required<MiddlewareOptions>,
  { webhooksMiddleware, oauthMiddleware }: any,
  request: IncomingMessage,
  response: ServerResponse,
  next?: Function
) {
  const { pathname } = new URL(request.url as string, "http://localhost");

  if (pathname === `${options.pathPrefix}/webhooks`) {
    return webhooksMiddleware(request, response, next);
  }
  if (pathname.startsWith(`${options.pathPrefix}/oauth/`)) {
    return oauthMiddleware(request, response, next);
  }

  const isExpressMiddleware = typeof next === "function";
  if (isExpressMiddleware) {
    // @ts-ignore `next` must be a function as we check two lines above
    return next();
  }

  return options.onUnhandledRequest(request, response);
}
