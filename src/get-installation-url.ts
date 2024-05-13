import type { App } from "./index.js";

let installationUrl: string | undefined;

export async function getInstallationUrl(app: App) {
  if (installationUrl) {
    return installationUrl;
  }

  const { data: appInfo } = await app.octokit.request("GET /app");
  installationUrl = `${appInfo.html_url}/installations/new`;
  return installationUrl;
}
