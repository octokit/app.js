import type { App } from "./index.js";
import type { GetInstallationUrlOptions } from "./types.js";

export function getInstallationUrlFactory(app: App) {
  let installationUrlBasePromise: Promise<string> | undefined;

  return async function getInstallationUrl(
    options: GetInstallationUrlOptions = {},
  ) {
    if (!installationUrlBasePromise) {
      installationUrlBasePromise = getInstallationUrlBase(app);
    }

    const installationUrlBase = await installationUrlBasePromise;
    const installationUrl = new URL(installationUrlBase);

    if (options.target_id !== undefined) {
      installationUrl.pathname += "/permissions";
      installationUrl.searchParams.append(
        "target_id",
        options.target_id.toFixed(),
      );
    }

    if (options.state !== undefined) {
      installationUrl.searchParams.append("state", options.state);
    }

    return installationUrl.href;
  };
}

async function getInstallationUrlBase(app: App) {
  const { data: appInfo } = await app.octokit.request("GET /app");
  if (!appInfo) {
    throw new Error("[@octokit/app] unable to fetch metadata for app");
  }
  return `${appInfo.html_url}/installations/new`;
}
