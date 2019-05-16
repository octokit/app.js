import { request } from '@octokit/request'

import { getCache } from './get-cache'
import { getInstallationAccessToken } from './get-installation-access-token'
import { getSignedJsonWebToken } from './get-signed-json-web-token'

export function App ({ id, privateKey, baseUrl, cache }) {
  const state = {
    id,
    privateKey,
    request: baseUrl ? request.defaults({ baseUrl }) : request,
    cache: cache || getCache()
  }
  const api = {
    getSignedJsonWebToken: getSignedJsonWebToken.bind(null, state),
    getInstallationAccessToken: getInstallationAccessToken.bind(null, state)
  }

  return api
}
