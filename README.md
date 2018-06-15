# app.js

> Official GitHub Platform for GitHub Apps in Node.js

## GitHub Apps

`@octokit/app.js` allows to authenticate as GitHub Apps, installations, listen
to webhooks, and respond to them using the GitHub API.

### Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key
and use it to sign a JSON Web Token (jwt) and encode it. 

```js
const auth = await appAuth({id, privateKey})
```

### Authenticating as an Installation

Once you have authenticated as a GitHub App, `auth` here, you can use that
in order to request an installation access token. This token is scoped for
your specific app and expires after an hour.

```js
const app = requestToken(auth)
```

### Listening on Webhooks

GitHub Apps give you the ability to listen for webhook events that happen on
GitHub. We recommend using `@octokit/webhooks`.

```js
require @octokit/webhooks

webhooks.on(app, 'issues.opened', {{id, name, payload, client}} => {
  console.log('An issue was opened!')
})
```

### Accessing API Endpoints

Now that you are recieving webhooks, you can take actions using both GitHub's
REST and GraphQL APIs via `@octokit/octokit.js`.

```js
require @octokit/octokit.js

rest.issues.createComment(app, {body: 'Hello, World!'})

graphql(app, `{
  viewer {
    login
  }
}`)
```

### Example Workflows

todo
