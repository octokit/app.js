import { Octokit } from "@octokit/core";
import { createAppAuth } from "@octokit/auth-app";
import { createUnauthenticatedAuth } from "@octokit/auth-unauthenticated";
import { Webhooks, type EmitterWebhookEvent } from "@octokit/webhooks";

import type { Options } from "./types";

export function webhooks(
  appOctokit: Octokit,
  options: Required<Options>["webhooks"],
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
          octokit,
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

      // set `x-github-delivery` header on all requests sent in response to the current
      // event. This allows GitHub Support to correlate the request with the event.
      // This is not documented and not considered public API, the header may change.
      // Once we document this as best practice on https://docs.github.com/en/rest/guides/best-practices-for-integrators
      // we will make it official
      /* istanbul ignore next */
      octokit.hook.before("request", (options) => {
        options.headers["x-github-delivery"] = event.id;
      });

      return {
        ...event,
        octokit,
      };
    },
  });
}
