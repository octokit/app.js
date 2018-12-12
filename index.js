module.exports = App

const getCache = require('./lib/get-cache')
const getInstallationAccessToken = require('./lib/get-installation-access-token')
const getSignedJsonWebToken = require('./lib/get-signed-json-web-token')

function App ({ id, privateKey, cache }) {
  const state = {
    id,
    privateKey,
    cache: cache || getCache()
  }
  const api = {
    getSignedJsonWebToken: getSignedJsonWebToken.bind(null, state),
    getInstallationAccessToken: getInstallationAccessToken.bind(null, state)
  }

  return api
}
