import { Octokit as OctokitCore } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";

import { Options } from "./types";
import { VERSION } from "./version";

export class App {
  static VERSION = VERSION;

  octokit: OctokitCore;

  constructor(options: Options = { oauth: {} } as Options) {
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
  }
}

export function getNodeMiddleware() {}
