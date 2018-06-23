# app.js

> Official GitHub Platform for GitHub Apps in Node.js

## GitHub Apps

`@octokit/app.js` allows to authenticate as GitHub Apps, installations, listen
to webhooks, and respond to them using the GitHub API.

### Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key
and use it to sign a JSON Web Token (jwt) and encode it. 

```js
const App = require('@octokit/app.js')

const app = new App({id, privateKey})
const appAuth = await app.appAuth()

// Example of using authetincated app to GET an individual installation
// https://developer.github.com/v3/apps/#find-repository-installation
const installation = await appAuth.request({
  method: 'GET',
  url: '/repos/:owner/:repo/installation',
  headers: { accept: 'application/vnd.github.machine-man-preview+json' },
  owner: 'hiimbex',
  repo: 'testing-things'
})

// contains the installation id necessary to authenticate as an installation
const installationId = installation.data.id
```

### Authenticating as an Installation

Once you have authenticated as a GitHub App, you can use that
in order to request an installation access token. Calling `requestToken()`
automatically performs the app authentication for you. This token is scoped for
your specific app and expires after an hour. 

```js
const app = require('@octokit/app.js')

const app = new App({id, privateKey})
const installation = await app.requestToken({installationId: 123})

// Example of opening an issue as an installation
// https://developer.github.com/v3/issues/#create-an-issue
const result = await installation.issues.create({
  owner: 'hiimbex',
  repo: 'tetsing-things',
  title: 'My installation’s first issue!'
})
```

### Listening on Webhooks

GitHub Apps give you the ability to listen for webhook events that happen on
GitHub. We recommend using `@octokit/webhooks`.

```js
const webhooks = require('@octokit/webhooks')

webhooks.on(app, 'issues.opened', {{id, name, payload, client}} => {
  console.log('An issue was opened!')
})
```

### Accessing API Endpoints

Now that you are recieving webhooks, you can take actions using both GitHub's
REST and GraphQL APIs via `@octokit/octokit.js`.

```js
const octokit = require('@octokit/octokit.js')

octokit.rest.issues.createComment(app, {body: 'Hello, World!'})

octokit.graphql(app, `{
  viewer {
    login
  }
}`)
```

### Example Workflows

todo
