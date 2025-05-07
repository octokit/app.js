import { createWebWorkerHandler as oauthWebMiddleware } from "@octokit/oauth-app";
import { createWebMiddleware as webhooksWebMiddleware } from "@octokit/webhooks";

import type { App } from "../../index.js";
import type { MiddlewareOptions } from "../types.js";

/* v8 ignore next */
function noop() {}

export function createWebMiddleware(
  app: App,
  options: MiddlewareOptions = {},
): (request: Request) => Promise<Response | undefined> {
  const log = Object.assign(
    {
      debug: noop,
      info: noop,
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    },
    options.log,
  );

  const optionsWithDefaults = {
    pathPrefix: "/api/github",
    ...options,
    log,
  };

  const webhooksMiddleware = webhooksWebMiddleware(app.webhooks, {
    path: optionsWithDefaults.pathPrefix + "/webhooks",
    log,
  });

  const oauthMiddleware = oauthWebMiddleware(app.oauth, {
    pathPrefix: optionsWithDefaults.pathPrefix + "/oauth",
  });

  return middleware.bind(
    null,
    optionsWithDefaults.pathPrefix,
    webhooksMiddleware,
    oauthMiddleware,
  );
}
export async function middleware(
  pathPrefix: string,
  webhooksMiddleware: ReturnType<typeof webhooksWebMiddleware>,
  oauthMiddleware: ReturnType<typeof oauthWebMiddleware>,
  request: Request,
): Promise<Response | undefined> {
  const { pathname } = new URL(request.url as string, "http://localhost");

  if (pathname.startsWith(`${pathPrefix}/`)) {
    if (pathname === `${pathPrefix}/webhooks`) {
      return webhooksMiddleware(request);
    } else if (pathname.startsWith(`${pathPrefix}/oauth/`)) {
      return oauthMiddleware(request);
    } else {
      return new Response(
        JSON.stringify({
          error: `Unknown route: ${request.method} ${request.url}`,
        }),
        {
          status: 404,
          headers: {
            "content-type": "application/json",
          },
        },
      );
    }
  } else {
    return undefined;
  }
}
