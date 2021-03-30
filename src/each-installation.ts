import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import { Octokit } from "@octokit/core";

import { App } from "./index";
import { EachInstallationFunction, EachInstallationInterface } from "./types";
import { getInstallationOctokit } from "./get-installation-octokit";

export function eachInstallationFactory(app: App) {
  return Object.assign(eachInstallation.bind(null, app), {
    iterator: eachInstallationIterator.bind(null, app),
  }) as EachInstallationInterface<Octokit>;
}

export async function eachInstallation(
  app: App,
  callback: EachInstallationFunction<Octokit>
) {
  const i = eachInstallationIterator(app)[Symbol.asyncIterator]();
  let result = await i.next();
  while (!result.done) {
    await callback(result.value);

    result = await i.next();
  }
}

export function eachInstallationIterator(app: App) {
  return {
    async *[Symbol.asyncIterator]() {
      const iterator = composePaginateRest.iterator(
        app.octokit,
        "GET /app/installations"
      );

      for await (const { data: installations } of iterator) {
        for (const installation of installations) {
          const installationOctokit = await getInstallationOctokit(
            app,
            installation.id
          );

          yield { octokit: installationOctokit, installation };
        }
      }
    },
  };
}
