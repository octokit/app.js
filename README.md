# app.js

> Official GitHub Platform for GitHub Apps in Node.js

### GitHub Apps

The difference to using `@octokit/app` standalone is that the current
`client` instance will be passed as additional context property passed to
the event handlers. The `client` instance will have default configuration set
for the respective event

```js
const app = client.app({id, privateKey, webhooks: {secret}})
app.webhooks.on('issues.opened', {{id, name, payload, client}} => {
  return client.rest.issues.createComment({body: 'Hello, World!'})
})
require('http').createServer(app.webhooks.middleware).listen(3000)
```
