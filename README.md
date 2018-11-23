## 🚧 This project is under construction and not yet ready for use! 🚧


# app.js

> GitHub App Authentication client for JavaScript

`@octokit/app` has methods to receive tokens for a GitHub app and its installations. The tokens can then be used to interact with GitHub’s [REST API](https://developer.github.com/v3/) or [GraphQL API](https://developer.github.com/v4/). Note that `@octokit/app` does not have methods to send any requests, you will need to use your own request library such as [`@octokit/request`](https://github.com/octokit/request). Alternatively you can use the [`octokit`](https://github.com/octokit/octokit.js) package which comes with everything you need to integrate with any of GitHub’s APIs.

## Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key
and use it to sign a JSON Web Token (jwt) and encode it.

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

Once you have authenticated as a GitHub App, you can use that
in order to request an installation access token. Calling `requestToken()`
automatically performs the app authentication for you. This token is scoped for
your specific app and expires after an hour.

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

## Listening on Webhooks

GitHub Apps give you the ability to listen for webhook events that happen on
GitHub. We recommend using `@octokit/webhooks`.

```js
const App = require('@octokit/app')
const webhooks = require('@octokit/webhooks')({
  secret
})
const app = new App({id, privateKey})

webhooks.on('issues.opened', {{id, name, payload}} => {
  console.log('An issue was opened!')
})

// can now receive webhook event requests at port 3000
require('http').createServer(webhooks.middleware).listen(3000)
```

You can also use the main `octokit` module which has APIs for both GitHub Apps
and webhooks.

```js
const client = require('octokit')()
const app = client.app({id, privateKey})

app.webhooks.on('issues.opened', {{id, name, payload, client}} => {
  console.log('An issue was opened!')
})
```

## Accessing API Endpoints

Now that you are receiving webhooks, you can take actions using both GitHub's
REST and GraphQL APIs via `octokit`. If you want to access API endpoints as
a GitHub App, we recommend using `octokit`'s built in app support.

```js
const Octokit = require('octokit')
const client = new Octokit()

const app = client.app({id, privateKey})

client.authenticate({token: await app.getInstallationAccesToken({installationId})})
client.rest.issues.createComment({owner: 'hiimbex', repo: 'testing-things', body: 'Hello, World!'})

client.graphql(`{
  viewer {
    login
  }
}`)
```

## License

[MIT](LICENSE)
