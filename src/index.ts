import { request } from "@octokit/request";

import { getCache } from "./get-cache";
import { getInstallationAccessToken } from "./get-installation-access-token";
import { getSignedJsonWebToken } from "./get-signed-json-web-token";
import { State, AppOptions, InstallationAccessTokenOptions } from "./types";
import { VERSION } from "./version";

let deprecateOnce = () => {
  console.warn(
    "[@octokit/app] Deprecated. Use @octokit/app-auth instead. See https://github.com/octokit/app.js/#deprecated"
  );
  deprecateOnce = () => {};
};

export class App {
  static VERSION = VERSION;

  constructor({ id, privateKey, baseUrl, cache }: AppOptions) {
    const state: State = {
      id,
      privateKey,
      request: baseUrl ? request.defaults({ baseUrl }) : request,
      cache: cache || getCache(),
    };

    this.getSignedJsonWebToken = getSignedJsonWebToken.bind(null, state);
    this.getInstallationAccessToken = getInstallationAccessToken.bind(
      null,
      state
    );

    deprecateOnce();
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
