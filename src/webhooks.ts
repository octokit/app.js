import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { Webhooks, WebhookEvent } from "@octokit/webhooks";

import { Options } from "./types";

export function webhooks(appOctokit: Octokit, options: Options["webhooks"]) {
  return new Webhooks<WebhookEvent, { octokit: InstanceType<typeof Octokit> }>({
    secret: options.secret,
    path: "/api/github/webhooks",
    transform: async (event) => {
      const octokit = (await appOctokit.auth({
        type: "installation",
        installationId: event.payload.installation.id,
        factory: (auth: any) => {
          return new auth.octokit.constructor({
            ...auth.octokitOptions,
            authStrategy: createAppAuth,
            ...{
              auth: {
                ...auth,
                installationId: event.payload.installation.id,
              },
            },
          });
        },
      })) as Octokit;

      return {
        ...event,
        octokit: octokit,
      };
    },
  });
}
