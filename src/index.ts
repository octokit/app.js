import { request } from "@octokit/request";

import { getCache } from "./get-cache";
import { getInstallationAccessToken } from "./get-installation-access-token";
import { getSignedJsonWebToken } from "./get-signed-json-web-token";
import LRUCache from "lru-cache";
import { State } from "./types";

interface AppOptions {
  id: number;
  privateKey: string;
  baseUrl?: string;
  cache?:
    | LRUCache<number, string>
    | {
        get: (key: number) => string;
        set: (key: number, value: string) => any;
      };
}

export class App {
  private api: {
    getSignedJsonWebToken: () => string;
    getInstallationAccessToken: (options: {
      installationId: number;
    }) => Promise<string>;
  };
  constructor({ id, privateKey, baseUrl, cache }: AppOptions) {
    const state: State = {
      id,
      privateKey,
      request: baseUrl ? request.defaults({ baseUrl }) : request,
      cache: cache || getCache()
    };
    this.api = {
      getSignedJsonWebToken: getSignedJsonWebToken.bind(null, state),
      getInstallationAccessToken: getInstallationAccessToken.bind(null, state)
    };
  }
  getSignedJsonWebToken(): string {
    return this.api.getSignedJsonWebToken();
  }

  getInstallationAccessToken(options: {
    installationId: number;
  }): Promise<string> {
    return this.api.getInstallationAccessToken(options);
  }
}
