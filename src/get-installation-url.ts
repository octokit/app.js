import type { App } from "./index.js";

export function getInstallationUrlFactory(app: App) {
  let installationUrl: string | undefined;

  return async function getInstallationUrl() {
    if (installationUrl) {
      return installationUrl;
    }

    const { data: appInfo } = await app.octokit.request("GET /app");
    if (!appInfo) {
      throw new Error("[@octokit/app] unable to fetch info for app");
    }
    installationUrl = `${appInfo.html_url}/installations/new`;
    return installationUrl;
  };
}
