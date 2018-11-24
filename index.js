module.exports = App

const getSignedJsonWebToken = require('./lib/get-signed-json-web-token')
const getInstallationAccesToken = require('./lib/get-installation-access-token')

function App ({ id, privateKey }) {
  const state = {
    id,
    privateKey
  }
  const api = {
    getSignedJsonWebToken: getSignedJsonWebToken.bind(null, state),
    getInstallationAccesToken: getInstallationAccesToken.bind(null, state)
  }

  return api
}
