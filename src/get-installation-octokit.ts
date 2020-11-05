import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/core";

import { App } from "./index";

export async function getInstallationOctokit(app: App, installationId: number) {
  return app.octokit.auth({
    type: "installation",
    installationId: installationId,
    factory(auth: any) {
      const options = {
        ...auth.octokitOptions,
        authStrategy: createAppAuth,
        ...{ auth: { ...auth, installationId: installationId } },
      };

      return new auth.octokit.constructor(options);
    },
  }) as Promise<Octokit>;
}
