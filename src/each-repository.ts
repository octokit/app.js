import { composePaginateRest } from "@octokit/plugin-paginate-rest";

import { App } from "./index";
import { EachRepositoryFunction, EachRepositoryInterface } from "./types";

export function eachRepositoryFactory(app: App) {
  return Object.assign(eachRepository.bind(null, app), {
    iterator: eachRepositoryIterator.bind(null, app),
  }) as EachRepositoryInterface;
}

export async function eachRepository(
  app: App,
  callback: EachRepositoryFunction
) {
  const i = eachRepositoryIterator(app)[Symbol.asyncIterator]();
  let result = await i.next();
  while (!result.done) {
    await callback(result.value);

    result = await i.next();
  }
}

export function eachRepositoryIterator(app: App) {
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
}
