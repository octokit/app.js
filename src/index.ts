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

export class App<O extends Options = Options> {
  static VERSION = VERSION;

  octokit: OctokitCore;
  webhooks: ReturnType<typeof webhooks>;
  // @ts-ignore calling app.oauth will throw a helpful error when options.oauth is not set
  oauth: OAuthApp;
  getInstallationOctokit: GetInstallationOctokitInterface;
  eachInstallation: EachInstallationInterface;
  eachRepository: EachRepositoryInterface;
  log: {
    debug: (message: string, additionalInfo?: object) => void;
    info: (message: string, additionalInfo?: object) => void;
    warn: (message: string, additionalInfo?: object) => void;
    error: (message: string, additionalInfo?: object) => void;
    [key: string]: unknown;
  };

  constructor(options: O) {
    const Octokit = options.Octokit || OctokitCore;

    const authOptions = Object.assign(
      {
        appId: options.appId,
        privateKey: options.privateKey,
      },
      options.oauth
        ? {
            clientId: options.oauth.clientId,
            clientSecret: options.oauth.clientSecret,
          }
        : {}
    );

    this.octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: authOptions,
      log: options.log,
    });

    this.log = Object.assign(
      {
        debug: () => {},
        info: () => {},
        warn: console.warn.bind(console),
        error: console.error.bind(console),
      },
      options.log
    );

    this.webhooks = webhooks(this.octokit, options.webhooks);

    // set app.oauth depending on whether "oauth" options have been passed
    if ("oauth" in options) {
      const oAuthAppOptions = {
        ...options.oauth,
        Octokit,
      } as ConstructorParameters<typeof OAuthApp>[0];
      this.oauth = new OAuthApp(oAuthAppOptions);
    } else {
      Object.defineProperty(this, "oauth", {
        get() {
          throw new Error(
            "[@octokit/app] oauth.clientId / oauth.clientSecret options are not set"
          );
        },
      });
    }

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
