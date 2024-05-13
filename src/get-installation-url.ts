import type { App } from "./index.js";

export function getInstallationUrlFactory(app: App) {
  let installationUrlPromise: Promise<string> | undefined;

  return async function getInstallationUrl(state?: string) {
    if (!installationUrlPromise) {
      installationUrlPromise = app.octokit
        .request("GET /app")
        .then(({ data: appInfo }) => {
          if (!appInfo) {
            throw new Error("[@octokit/app] unable to fetch info for app");
          }
          return `${appInfo.html_url}/installations/new`;
        });
    }

    const installationUrl = await installationUrlPromise;
    if (state === undefined) {
      return installationUrlPromise;
    }

    const installationUrlWithState = new URL(installationUrl);
    installationUrlWithState.searchParams.append("state", state);
    return installationUrlWithState.href;
  };
}
