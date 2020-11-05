import { Octokit as OctokitCore } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import {
  OAuthApp,
  getNodeMiddleware as oauthNodeMiddleware,
} from "@octokit/oauth-app";

import {
  Options,
  EachInstallationInterface,
  EachRepositoryInterface,
} from "./types";
import { VERSION } from "./version";
import { webhooks } from "./webhooks";
import { eachInstallationFactory } from "./each-installation";
import { eachRepositoryFactory } from "./each-repository";

export class App {
  static VERSION = VERSION;

  /**
   * Octokit instance
   */
  octokit: OctokitCore;

  /**
   * Webhooks instance
   */
  webhooks: ReturnType<typeof webhooks>;

  /**
   * oauth app instance
   */
  oauth: OAuthApp;

  eachRepository: EachRepositoryInterface;
  eachInstallation: EachInstallationInterface;

  constructor(options: Options) {
    const Octokit = options.Octokit || OctokitCore;
    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        appId: options.appId,
        privateKey: options.privateKey,
        clientId: options.oauth.clientId,
        clientSecret: options.oauth.clientSecret,
      },
    });

    this.webhooks = webhooks(this.octokit, options.webhooks);

    this.oauth = new OAuthApp({
      ...options.oauth,
      Octokit,
    });

    this.eachInstallation = eachInstallationFactory(this);
    this.eachRepository = eachRepositoryFactory(this);
  }
}

export function getNodeMiddleware(app: App) {
  return oauthNodeMiddleware(app.oauth, {
    onUnhandledRequest: (request, response) => {
      return app.webhooks.middleware(request, response);
    },
  });
}
