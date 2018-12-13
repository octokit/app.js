module.exports = getInstallationAccessToken

const getSignedJsonWebToken = require('./get-signed-json-web-token')

// https://developer.github.com/v3/apps/#create-a-new-installation-token
function getInstallationAccessToken (state, { installationId }) {
  const token = state.cache.get(installationId)
  if (token) {
    return Promise.resolve(token)
  }

  return state.request({
    method: 'POST',
    url: '/app/installations/:installation_id/access_tokens',
    installation_id: installationId,
    headers: {
      accept: 'application/vnd.github.machine-man-preview+json',
      // TODO: cache the installation token if it's been less than 60 minutes
      authorization: `bearer ${getSignedJsonWebToken(state)}`
    }
  }).then(response => {
    state.cache.set(installationId, response.data.token)
    return response.data.token
  })
}
