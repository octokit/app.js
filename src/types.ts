import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";

export type Options = {
  appId: number | string;
  privateKey: string;
  oauth: {
    clientId: string;
    clientSecret: string;
  };
  webhooks: {
    secret: string;
  };
  Octokit?: typeof Octokit;
};

type EachInstallationFunctionOptions = {
  octokit: Octokit;
  installation: Endpoints["GET /app/installations"]["response"]["data"][0];
};
export type EachInstallationFunction = (
  options: EachInstallationFunctionOptions
) => unknown | Promise<unknown>;

export interface EachInstallationInterface {
  (callback: EachInstallationFunction): Promise<void>;
  iterator: () => AsyncIterable<EachInstallationFunctionOptions>;
}

type EachRepositoryFunctionOptions = {
  octokit: Octokit;
  repository: Endpoints["GET /installation/repositories"]["response"]["data"]["repositories"][0];
};
export type EachRepositoryFunction = (
  options: EachRepositoryFunctionOptions
) => unknown | Promise<unknown>;

export interface EachRepositoryInterface {
  (callback: EachRepositoryFunction): Promise<void>;
  iterator: () => AsyncIterable<EachRepositoryFunctionOptions>;
}
