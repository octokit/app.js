# app.js

> Official GitHub Platform for GitHub Apps in Node.js

## GitHub Apps

`@octokit/app` allows to authenticate as GitHub Apps, installations, listen
to webhooks, and respond to them using the GitHub API.

### Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key
and use it to sign a JSON Web Token (jwt) and encode it. 

```js
const App = require('@octokit/app')
const got = require('got') // an example of a request library

const app = new App({id, privateKey})
const appAuth = await app.appAuth()

// Example of using authetincated app to GET an individual installation
// https://developer.github.com/v3/apps/#find-repository-installation
const {body} = await got('https://api.github.com/repos/hiimbex/testing-things/installation', {
  headers: {
    authorization: `token ${appAuth}`, // your JWT
    accept: 'application/vnd.github.machine-man-preview+json'
  }
})

// contains the installation id necessary to authenticate as an installation
const installationId = body.data.id
```

### Authenticating as an Installation

Once you have authenticated as a GitHub App, you can use that
in order to request an installation access token. Calling `requestToken()`
automatically performs the app authentication for you. This token is scoped for
your specific app and expires after an hour. 

```js
const got = require('got') // an example of a request library
const App = require('@octokit/app')
const app = new App({id, privateKey})

const installationAccessToken = await app.requestToken({installationId: 123})

// https://developer.github.com/v3/issues/#create-an-issue
const {data: {total_count}} = await got.post('https://api.github.com/repos/hiimbex/tetsing-things/issues', {
  body: {title: 'My installation’s first issue'},
  headers: {
    authorization: `token ${installationAccessToken}`,
    accept: 'application/vnd.github.machine-man-preview+json'
  }
})
```

### Listening on Webhooks

GitHub Apps give you the ability to listen for webhook events that happen on
GitHub. We recommend using `@octokit/webhooks`.

```js
const webhooks = require('@octokit/webhooks')
const App = require('@octokit/app')
const app = new App({id, privateKey})

webhooks.on(app, 'issues.opened', {{id, name, payload, client}} => {
  console.log('An issue was opened!')
})
```

You can also use `octokit`'s built in support for Apps and webhooks.

```js
const Octokit = require('octokit')
const client = new Octokit()

const app = client.app({id, privateKey})

app.webhooks.on('issues.opened', {{id, name, payload, client}} => {
  console.log('An issue was opened!')
})
```

### Accessing API Endpoints

Now that you are recieving webhooks, you can take actions using both GitHub's
REST and GraphQL APIs via `octokit`. If you want to access API endpoints as
a GitHub App, we recommend using `octokit`'s built in app support.

```js
const Octokit = require('octokit')
const client = new Octokit()

const app = client.app({id, privateKey})

app.rest.issues.createComment({owner: 'hiimbex', repo: 'testing-things', body: 'Hello, World!'})

app.graphql(`{
  viewer {
    login
  }
}`)
```

### Example Workflows

todo
