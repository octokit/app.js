import { Octokit as OctokitCore } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import {
  OAuthApp,
  getNodeMiddleware as oauthNodeMiddleware,
} from "@octokit/oauth-app";

import { Endpoints } from "@octokit/types";

import { Options } from "./types";
import { VERSION } from "./version";
import { webhooks } from "./webhooks";

type EachInstallationIterator = AsyncIterable<{
  octokit: OctokitCore;
  installation: Endpoints["GET /app/installations"]["response"]["data"][0];
}>;

type EachRepositoryIterator = AsyncIterable<{
  octokit: OctokitCore;
  repository: Endpoints["GET /installation/repositories"]["response"]["data"]["repositories"][0];
}>;

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

  eachRepository: {
    iterator: () => EachRepositoryIterator;
  };
  eachInstallation: {
    iterator: () => EachInstallationIterator;
  };

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

    const app = this;
    this.eachInstallation = {
      iterator: () => {
        return {
          async *[Symbol.asyncIterator]() {
            const iterator = composePaginateRest.iterator(
              app.octokit,
              "GET /app/installations"
            );

            for await (const { data: installations } of iterator) {
              for (const installation of installations) {
                const installationOctokit = (await app.octokit.auth({
                  type: "installation",
                  installationId: installation.id,
                  factory: (auth: any) => {
                    return new auth.octokit.constructor({
                      ...auth.octokitOptions,
                      authStrategy: createAppAuth,
                      ...{ auth: { ...auth, installationId: installation.id } },
                    });
                  },
                })) as OctokitCore;

                yield { octokit: installationOctokit, installation };
              }
            }
          },
        };
      },
    };

    this.eachRepository = {
      iterator: () => {
        return {
          async *[Symbol.asyncIterator]() {
            for await (const { octokit } of app.eachInstallation.iterator()) {
              const repositoriesIterator = composePaginateRest.iterator(
                octokit,
                "GET /installation/repositories"
              );

              for await (const { data: repositories } of repositoriesIterator) {
                for (const repository of repositories) {
                  yield { octokit: octokit, repository };
                }
              }
            }
          },
        };
      },
    };
  }
}

export function getNodeMiddleware(app: App) {
  return oauthNodeMiddleware(app.oauth, {
    onUnhandledRequest: (request, response) => {
      return app.webhooks.middleware(request, response);
    },
  });
}
