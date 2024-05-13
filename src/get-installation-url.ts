import type { App } from "./index.js";

export function getInstallationUrlFactory(app: App) {
  let installationUrlPromise: Promise<string> | undefined;

  return function getInstallationUrl() {
    if (installationUrlPromise) {
      return installationUrlPromise;
    }

    installationUrlPromise = app.octokit
      .request("GET /app")
      .then(({ data: appInfo }) => {
        if (!appInfo) {
          throw new Error("[@octokit/app] unable to fetch info for app");
        }

        return `${appInfo.html_url}/installations/new`;
      });
    return installationUrlPromise;
  };
}
