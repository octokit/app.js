## 🚧 This project is under construction and not yet ready for use! 🚧


# app.js

> GitHub App Authentication client for JavaScript

`@octokit/app` has methods to receive tokens for a GitHub app and its installations. The tokens can then be used to interact with GitHub’s [REST API](https://developer.github.com/v3/) or [GraphQL API](https://developer.github.com/v4/). Note that `@octokit/app` does not have methods to send any requests, you will need to use your own request library such as [`@octokit/request`](https://github.com/octokit/request). Alternatively you can use the [`octokit`](https://github.com/octokit/octokit.js) package which comes with everything you need to integrate with any of GitHub’s APIs.

## Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key and use it to sign a JSON Web Token (jwt) and encode it. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/).

```js
const App = require('@octokit/app')
const request = require('@octokit/request')

const APP_ID = 1 // replace with your app ID
const PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\n...' // replace with contents of your private key. Replace line breaks with \n

const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY })
const jwt = await app.getSignedJsonWebToken()

// Example of using authenticated app to GET an individual installation
// https://developer.github.com/v3/apps/#find-repository-installation
const { data } = await request('GET /repos/:owner/:repo/installation', {
  owner: 'hiimbex',
  repo: 'testing-things',
  headers: {
    authorization: `Bearer ${jwt}`,
    accept: 'application/vnd.github.machine-man-preview+json'
  }
})

// contains the installation id necessary to authenticate as an installation
const installationId = body.data.id
```

## Authenticating as an Installation

Once you have authenticated as a GitHub App, you can use that in order to request an installation access token. Calling `requestToken()` automatically performs the app authentication for you. This token is scoped for your specific app and expires after an hour. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation).

```js
const App = require('@octokit/app')
const request = require('@octokit/request')

const APP_ID = 1 // replace with your app ID
const PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\n...' // replace with contents of your private key. Replace line breaks with \n

const app = new App({ id: APP_ID, privateKey: PRIVATE_KEY })
const installationAccessToken = await app.getInstallationAccesToken({ installationId })

// https://developer.github.com/v3/issues/#create-an-issue
await request('POST /repos/:owner/:repo/issues', {
  owner: 'hiimbex',
  repo: 'testing-things',
  headers: {
    authorization: `token ${installationAccessToken}`,
    accept: 'application/vnd.github.machine-man-preview+json'
  },
  title: 'My installation’s first issue'
})
```

## License

[MIT](LICENSE)
