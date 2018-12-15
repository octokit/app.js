/* global describe, beforeEach, it */

const { expect } = require('chai')
const lolex = require('lolex')
const nock = require('nock')
const simple = require('simple-mock')

const App = require('..')
const APP_ID = 1
const PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1c7+9z5Pad7OejecsQ0bu3aozN3tihPmljnnudb9G3HECdnH
lWu2/a1gB9JW5TBQ+AVpum9Okx7KfqkfBKL9mcHgSL0yWMdjMfNOqNtrQqKlN4kE
p6RD++7sGbzbfZ9arwrlD/HSDAWGdGGJTSOBM6pHehyLmSC3DJoR/CTu0vTGTWXQ
rO64Z8tyXQPtVPb/YXrcUhbBp8i72b9Xky0fD6PkEebOy0Ip58XVAn2UPNlNOSPS
ye+Qjtius0Md4Nie4+X8kwVI2Qjk3dSm0sw/720KJkdVDmrayeljtKBx6AtNQsSX
gzQbeMmiqFFkwrG1+zx6E7H7jqIQ9B6bvWKXGwIDAQABAoIBAD8kBBPL6PPhAqUB
K1r1/gycfDkUCQRP4DbZHt+458JlFHm8QL6VstKzkrp8mYDRhffY0WJnYJL98tr4
4tohsDbqFGwmw2mIaHjl24LuWXyyP4xpAGDpl9IcusjXBxLQLp2m4AKXbWpzb0OL
Ulrfc1ZooPck2uz7xlMIZOtLlOPjLz2DuejVe24JcwwHzrQWKOfA11R/9e50DVse
hnSH/w46Q763y4I0E3BIoUMsolEKzh2ydAAyzkgabGQBUuamZotNfvJoDXeCi1LD
8yNCWyTlYpJZJDDXooBU5EAsCvhN1sSRoaXWrlMSDB7r/E+aQyKua4KONqvmoJuC
21vSKeECgYEA7yW6wBkVoNhgXnk8XSZv3W+Q0xtdVpidJeNGBWnczlZrummt4xw3
xs6zV+rGUDy59yDkKwBKjMMa42Mni7T9Fx8+EKUuhVK3PVQyajoyQqFwT1GORJNz
c/eYQ6VYOCSC8OyZmsBM2p+0D4FF2/abwSPMmy0NgyFLCUFVc3OECpkCgYEA5OAm
I3wt5s+clg18qS7BKR2DuOFWrzNVcHYXhjx8vOSWV033Oy3yvdUBAhu9A1LUqpwy
Ma+unIgxmvmUMQEdyHQMcgBsVs10dR/g2xGjMLcwj6kn+xr3JVIZnbRT50YuPhf+
ns1ScdhP6upo9I0/sRsIuN96Gb65JJx94gQ4k9MCgYBO5V6gA2aMQvZAFLUicgzT
u/vGea+oYv7tQfaW0J8E/6PYwwaX93Y7Q3QNXCoCzJX5fsNnoFf36mIThGHGiHY6
y5bZPPWFDI3hUMa1Hu/35XS85kYOP6sGJjf4kTLyirEcNKJUWH7CXY+00cwvTkOC
S4Iz64Aas8AilIhRZ1m3eQKBgQCUW1s9azQRxgeZGFrzC3R340LL530aCeta/6FW
CQVOJ9nv84DLYohTVqvVowdNDTb+9Epw/JDxtDJ7Y0YU0cVtdxPOHcocJgdUGHrX
ZcJjRIt8w8g/s4X6MhKasBYm9s3owALzCuJjGzUKcDHiO2DKu1xXAb0SzRcTzUCn
7daCswKBgQDOYPZ2JGmhibqKjjLFm0qzpcQ6RPvPK1/7g0NInmjPMebP0K6eSPx0
9/49J6WTD++EajN7FhktUSYxukdWaCocAQJTDNYP0K88G4rtC2IYy5JFn9SWz5oh
x//0u+zd/R/QRUzLOw4N72/Hu+UG6MNt5iDZFCtapRaKt6OvSBwy8w==
-----END RSA PRIVATE KEY-----`
// see https://runkit.com/gr2m/reproducable-jwt
const BEARER = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjAsImV4cCI6NjAsImlzcyI6MX0.ZalS1qAAUBHId9BnP-XlfZXRUMg5CRiGbCfO1Sb1GxJBfQbz7kmxlBlgMOmODEM9xmKvG1kIKa3IXLD2ZJaLaiwAeIDjoRz-AhFpD1OaKAMin9HQ7SSi6HbQmhM8x4ABZGuagMJDZxdrJWEIl4uD0SRC30pSfSeQtVzFgwvDSXqdf-dQu1QS-ISAWv7ifhhoHLBujCS2Bpvzf36d_RgedKGZrQCJlaPJyJGTi-iuQfH2THqFJZLtW4Hl-nyThdmoKGDhMTF4nCiXM9pOD7XRBts1hBbSUqxZmDF_SRkTHapQtWYQb-MT7A_NEZSs6nawmuYJmJ4kvHoIvgy5n_3NHQ'

// simulate the beginning of unix time so that Date.now() returns 0
// that way the signed token is always the same
// Documentation: https://git.io/fASyr
const clock = lolex.install({ now: 0, toFake: ['Date', 'setTimeout'] })

describe('app.js', () => {
  let app

  beforeEach(function () {
    // set up stuff
    app = new App({
      id: APP_ID, privateKey: PRIVATE_KEY
    })
  })

  // see https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-a-github-app
  it('gets bearer token', function () {
    const bearer = app.getSignedJsonWebToken()
    expect(bearer).to.equal(BEARER)
  })

  // see https://developer.github.com/v3/apps/#create-a-new-installation-token
  it('gets installation token', () => {
    nock('https://api.github.com', {
      reqheaders: {
        authorization: `bearer ${BEARER}` // installation access token
      }
    })
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })

    return app.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(token).to.equal('foo')
      })
  })

  it('gets installation token from cache', () => {
    nock('https://api.github.com')
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })

    return app.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(token).to.equal('foo')

        return app.getInstallationAccessToken({ installationId: 123 })
      })
      .then(token => {
        expect(token).to.equal('foo')
      })
  })

  it('caches based on installation id', () => {
    nock('https://api.github.com')
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })
      .post('/app/installations/456/access_tokens')
      .reply(201, {
        token: 'bar'
      })

    return app.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(token).to.equal('foo')

        return app.getInstallationAccessToken({ installationId: 456 })
      })
      .then(token => {
        expect(token).to.equal('bar')
      })
  })

  const oneHourInMs = 1000 * 60 * 60
  it('request installation again after timeout', () => {
    const mock = nock('https://api.github.com')
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'bar'
      })

    return app.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(token).to.equal('foo')

        return new Promise(resolve => {
          setTimeout(resolve, oneHourInMs)
          clock.tick(oneHourInMs)
        })
      })
      .then(() => {
        return app.getInstallationAccessToken({ installationId: 123 })
      })
      .then(token => {
        expect(token).to.equal('bar')
        expect(mock.pendingMocks()).to.deep.equal([])
      })
  }).timeout(oneHourInMs + 2000)

  it('supports custom cache', () => {
    nock('https://api.github.com')
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })

    const options = {
      id: APP_ID,
      privateKey: PRIVATE_KEY,
      cache: {
        get: simple.stub(),
        set: simple.stub()
      }
    }
    const appWithCustomCache = new App(options)

    return appWithCustomCache.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(options.cache.get.callCount).to.equal(1)
        expect(options.cache.set.callCount).to.equal(1)
      })
  })

  it('supports custom base url', () => {
    nock('https://github-enterprise.com/api/v3')
      .post('/app/installations/123/access_tokens')
      .reply(201, {
        token: 'foo'
      })

    const options = {
      id: APP_ID,
      privateKey: PRIVATE_KEY,
      baseUrl: 'https://github-enterprise.com/api/v3'
    }
    const appWithCustomEndpointDefaults = new App(options)

    return appWithCustomEndpointDefaults.getInstallationAccessToken({ installationId: 123 })
      .then(token => {
        expect(token).to.equal('foo')
      })
  })
})
