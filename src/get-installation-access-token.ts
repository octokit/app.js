import { getSignedJsonWebToken } from "./get-signed-json-web-token";
import { State, InstallationAccessTokenOptions } from "./types";

// https://developer.github.com/v3/apps/#create-a-new-installation-token
export function getInstallationAccessToken(
  state: State,
  { installationId, repositoryIds, permissions }: InstallationAccessTokenOptions
): Promise<string> {
  const token = state.cache.get(installationId);
  if (token) {
    return Promise.resolve(token);
  }

  return state
    .request({
      method: "POST",
      url: "/app/installations/:installation_id/access_tokens",
      installation_id: installationId,
      headers: {
        accept: "application/vnd.github.machine-man-preview+json",
        // TODO: cache the installation token if it's been less than 60 minutes
        authorization: `bearer ${getSignedJsonWebToken(state)}`
      },
      repository_ids: repositoryIds,
      permissions
    })
    .then(response => {
      state.cache.set(installationId, response.data.token);
      return response.data.token;
    });
}
