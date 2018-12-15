module.exports = App

const request = require('@octokit/request')

const getCache = require('./lib/get-cache')
const getInstallationAccessToken = require('./lib/get-installation-access-token')
const getSignedJsonWebToken = require('./lib/get-signed-json-web-token')

function App ({ id, privateKey, baseUrl, cache }) {
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
