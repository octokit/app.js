# app.js

> Official GitHub Platform for GitHub Apps in Node.js

## GitHub Apps

`@octokit/app.js` allows users to authenticate as GitHub Apps, Listen on
Webhooks, and respond to them using the GitHub API.

### Authenticating (AKA Getting your Acess Token)

In order to take action as a GitHub App, you need to create an Authentication
Token. In order to do this you need to generate a Private Key and use it to
sign a JSON Web Token (jwt) and encode it. You can then use that jwt in order
to request an Acess Token.

```js
const auth = await appAuth({id, privateKey})
const client = requestToken(auth)
```

### Listening on Webhooks

GitHub Apps give you the ability to listen for webhook events that happen on
GitHub and take action. The `client` also comes with a built in logger.

```js
client.app.webhooks.on('issues.opened', {{id, name, payload, client}} => {
  client.app.log('An issue was opened!')
})
```

### Accessing API Endpoints

Now that you are recieving webhooks, you can take actions using both GitHub's
REST and GraphQL APIs.

```js
client.rest.issues.createComment({body: 'Hello, World!'})

client.graphql(`{
  viewer {
    login
  }
}`)
```

### Example Workflows

todo
