import { request } from "@octokit/request";

import { getCache } from "./get-cache";
import { getInstallationAccessToken } from "./get-installation-access-token";
import { getSignedJsonWebToken } from "./get-signed-json-web-token";
import LRUCache from "lru-cache";
import { State, AppOptions, InstallationAccessTokenOptions } from "./types";

export class App {
  constructor({ id, privateKey, baseUrl, cache }: AppOptions) {
    const state: State = {
      id,
      privateKey,
      request: baseUrl ? request.defaults({ baseUrl }) : request,
      cache: cache || getCache()
    };

    this.getSignedJsonWebToken = getSignedJsonWebToken.bind(null, state);
    this.getInstallationAccessToken = getInstallationAccessToken.bind(
      null,
      state
    );
  }

  /**
   * In order to authenticate as a GitHub App, you need to generate a Private Key and use it to sign a JSON Web Token (jwt) and encode it. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/).
   */
  getSignedJsonWebToken: () => string;

  /**
   * Once you have authenticated as a GitHub App, you can use that in order to request an installation access token. Calling `requestToken()` automatically performs the app authentication for you. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation).
   */
  getInstallationAccessToken: (
    options: InstallationAccessTokenOptions
  ) => Promise<string>;
}
