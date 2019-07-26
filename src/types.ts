import LRUCache from "lru-cache";
import { request } from "@octokit/request";

export interface State {
  id: number;
  privateKey: string;
  request: typeof request;
  cache:
    | LRUCache<number, string>
    | {
        get: (key: number) => string;
        set: (key: number, value: string) => any;
      };
}

export interface AppOptions {
  /**
   * App ID. Can be found in the app’s settings
   */
  id: number;

  /**
   * Content of the app’s *.pem file. Can be created in the app’s settings
   */
  privateKey: string;

  /**
   * Set `baseUrl` for use with GitHub enterprise.
   *
   * @example `'https://github-enterprise.com/api/v3'`
   */
  baseUrl?: string;

  /**
   * Installation tokens expire after an hour. By default, `@octokit/app` is caching up to 15000 tokens simultaneously using [`lru-cache`](https://github.com/isaacs/node-lru-cache). You can pass your own cache implementation by passing `options.cache.{get,set}` to the constructor.
   */
  cache?:
    | LRUCache<number, string>
    | {
        get: (key: number) => string;
        set: (key: number, value: string) => any;
      };
}

export type InstallationAccessTokenOptions = {
  /**
   * Find the app’s installation token at https://github.com/apps/<app name>/installations/new. Select the account then copy the number from the end of the URL
   */
  installationId: number;
  repositoryIds?: number[];
  permissions?: { [permission: string]: string };
};
