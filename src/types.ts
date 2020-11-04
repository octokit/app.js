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
