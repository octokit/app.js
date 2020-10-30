import { Octokit } from "@octokit/core";

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
