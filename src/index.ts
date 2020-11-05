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
  GetInstallationOctokitInterface,
} from "./types";
import { VERSION } from "./version";
import { webhooks } from "./webhooks";
import { eachInstallationFactory } from "./each-installation";
import { eachRepositoryFactory } from "./each-repository";
import { getInstallationOctokit } from "./get-installation-octokit";

export class App {
  static VERSION = VERSION;

  octokit: OctokitCore;
  webhooks: ReturnType<typeof webhooks>;
  oauth: OAuthApp;
  getInstallationOctokit: GetInstallationOctokitInterface;
  eachInstallation: EachInstallationInterface;
  eachRepository: EachRepositoryInterface;

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

    this.getInstallationOctokit = getInstallationOctokit.bind(null, this);
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
