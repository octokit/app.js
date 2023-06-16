import { composePaginateRest } from "@octokit/plugin-paginate-rest";
import { Octokit } from "@octokit/core";

import { App } from "./index";
import {
  EachRepositoryFunction,
  EachRepositoryInterface,
  EachRepositoryQuery,
} from "./types";

export function eachRepositoryFactory(app: App) {
  return Object.assign(eachRepository.bind(null, app), {
    iterator: eachRepositoryIterator.bind(null, app),
  }) as EachRepositoryInterface<Octokit>;
}

export async function eachRepository(
  app: App,
  queryOrCallback: EachRepositoryQuery | EachRepositoryFunction<Octokit>,
  callback?: EachRepositoryFunction<Octokit>
) {
  const i = eachRepositoryIterator(
    app,
    callback ? (queryOrCallback as EachRepositoryQuery) : undefined
  )[Symbol.asyncIterator]();
  let result = await i.next();
  while (!result.done) {
    if (callback) {
      await callback(result.value);
    } else {
      await (queryOrCallback as EachRepositoryFunction<Octokit>)(result.value);
    }

    result = await i.next();
  }
}

function singleInstallationIterator(app: App, installationId: number) {
  return {
    async *[Symbol.asyncIterator]() {
      yield {
        octokit: await app.getInstallationOctokit(installationId),
      };
    },
  };
}

export function eachRepositoryIterator(app: App, query?: EachRepositoryQuery) {
  return {
    async *[Symbol.asyncIterator]() {
      const iterator = query
        ? singleInstallationIterator(app, query.installationId)
        : app.eachInstallation.iterator();
      for await (const { octokit } of iterator) {
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
}
