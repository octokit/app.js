// remove type imports from http for Deno compatibility
// see https://github.com/octokit/octokit.js/issues/24#issuecomment-817361886
// import { IncomingMessage, ServerResponse } from "http";
type IncomingMessage = any;
type ServerResponse = any;

import {
  createNodeMiddleware as oauthNodeMiddleware,
  sendNodeResponse,
  unknownRouteResponse,
} from "@octokit/oauth-app";
import { createNodeMiddleware as webhooksNodeMiddleware } from "@octokit/webhooks";

import { App } from "../../index";
import type { Options } from "../../types";

export type MiddlewareOptions = {
  pathPrefix?: string;
  log?: Options["log"];
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
    pathPrefix: "/api/github",
    ...options,
    log,
  };

  const webhooksMiddleware = webhooksNodeMiddleware(app.webhooks, {
    path: optionsWithDefaults.pathPrefix + "/webhooks",
    log,
  });

  const oauthMiddleware = oauthNodeMiddleware(app.oauth, {
    pathPrefix: optionsWithDefaults.pathPrefix + "/oauth",
  });

  return middleware.bind(
    null,
    optionsWithDefaults.pathPrefix,
    webhooksMiddleware,
    oauthMiddleware
  );
}

export async function middleware(
  pathPrefix: string,
  webhooksMiddleware: any,
  oauthMiddleware: any,
  request: IncomingMessage,
  response: ServerResponse,
  next?: Function
): Promise<boolean> {
  const { pathname } = new URL(request.url as string, "http://localhost");

  if (pathname.startsWith(`${pathPrefix}/`)) {
    if (pathname === `${pathPrefix}/webhooks`) {
      webhooksMiddleware(request, response);
    } else if (pathname.startsWith(`${pathPrefix}/oauth/`)) {
      oauthMiddleware(request, response);
    } else {
      sendNodeResponse(unknownRouteResponse(request), response);
    }
    return true;
  } else {
    next?.();
    return false;
  }
}
