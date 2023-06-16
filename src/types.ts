import { Octokit } from "@octokit/core";
import { Endpoints } from "@octokit/types";

export type Options = {
  appId?: number | string;
  privateKey?: string;
  webhooks?: {
    secret: string;
  };
  oauth?: {
    clientId: string;
    clientSecret: string;
    allowSignup?: boolean;
  };
  Octokit?: typeof Octokit;
  log?: {
    debug: (...data: any[]) => void;
    info: (...data: any[]) => void;
    warn: (...data: any[]) => void;
    error: (...data: any[]) => void;
  };
};

// workaround for https://github.com/octokit/app.js/pull/227
// we cannot make appId & privateKey required on Options because
// it would break inheritance of the Octokit option set via App.defaults({ Octokit })
export type ConstructorOptions<TOptions extends Options> = TOptions & {
  appId: number | string;
  privateKey: string;
};

export type InstallationFunctionOptions<O> = {
  octokit: O;
  installation: Endpoints["GET /app/installations"]["response"]["data"][0];
};
export type EachInstallationFunction<O> = (
  options: InstallationFunctionOptions<O>
) => unknown | Promise<unknown>;

export interface EachInstallationInterface<O> {
  (callback: EachInstallationFunction<O>): Promise<void>;
  iterator: () => AsyncIterable<InstallationFunctionOptions<O>>;
}

type EachRepositoryFunctionOptions<O> = {
  octokit: O;
  repository: Endpoints["GET /installation/repositories"]["response"]["data"]["repositories"][0];
};
export type EachRepositoryFunction<O> = (
  options: EachRepositoryFunctionOptions<O>
) => unknown | Promise<unknown>;
export type EachRepositoryQuery = {
  installationId: number;
};

export interface EachRepositoryInterface<O> {
  (callback: EachRepositoryFunction<O>): Promise<void>;
  (
    query: EachRepositoryQuery,
    callback: EachRepositoryFunction<O>
  ): Promise<void>;
  iterator: (
    query?: EachRepositoryQuery
  ) => AsyncIterable<EachRepositoryFunctionOptions<O>>;
}

export interface GetInstallationOctokitInterface<O> {
  (installationId: number): Promise<O>;
}
