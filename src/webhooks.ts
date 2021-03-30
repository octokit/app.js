import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { createUnauthenticatedAuth } from "@octokit/auth-unauthenticated";
import { Webhooks, EmitterWebhookEvent } from "@octokit/webhooks";

import { Options } from "./types";

export function webhooks(
  appOctokit: Octokit,
  options: Required<Options>["webhooks"]
  // Explict return type for better debugability and performance,
  // see https://github.com/octokit/app.js/pull/201
): Webhooks<EmitterWebhookEvent & { octokit: Octokit }> {
  return new Webhooks({
    secret: options.secret,
    transform: async (event) => {
      if (
        !("installation" in event.payload) ||
        typeof event.payload.installation !== "object"
      ) {
        const octokit = new (appOctokit.constructor as typeof Octokit)({
          authStrategy: createUnauthenticatedAuth,
          auth: {
            reason: `"installation" key missing in webhook event payload`,
          },
        });

        return {
          ...event,
          octokit: octokit,
        };
      }

      const installationId = event.payload.installation.id;
      const octokit = (await appOctokit.auth({
        type: "installation",
        installationId,
        factory(auth: any) {
          return new auth.octokit.constructor({
            ...auth.octokitOptions,
            authStrategy: createAppAuth,
            ...{
              auth: {
                ...auth,
                installationId,
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
