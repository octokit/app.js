import { createAppAuth } from "@octokit/auth-app";
import type { Octokit } from "@octokit/core";

import type { App } from "./index.js";

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
