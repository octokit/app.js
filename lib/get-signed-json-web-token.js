module.exports = getSignedJsonWebToken

const jsonwebtoken = require('jsonwebtoken')

function getSignedJsonWebToken ({ id, privateKey }) {
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iat: now, // Issued at time
    exp: now + 60, // JWT expiration time (10 minute maximum)
    iss: id
  }
  const token = jsonwebtoken.sign(payload, privateKey, { algorithm: 'RS256' })
  return token
}
