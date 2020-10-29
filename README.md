<a name="deprecated"></a>

# ⚠️ Deprecated

`@octokit/app` is being deprecated in favor of [`@octokit/auth-app`](https://github.com/octokit/auth-app.js/#readme). The `@octokit/app` package will be repurposed, starting with version 10.0.0.

See usage examples for `@octokit/auth-app` below the examples for `@octokit/app`.

# app.js

> GitHub App Authentication client for JavaScript

[![@latest](https://img.shields.io/npm/v/@octokit/app.svg)](https://www.npmjs.com/package/@octokit/app)
[![Test](https://github.com/octokit/app.js/workflows/Test/badge.svg)](https://github.com/octokit/app.js/actions?query=workflow%3ATest)

`@octokit/app` has methods to receive tokens for a GitHub app and its installations. The tokens can then be used to interact with GitHub’s [REST API](https://developer.github.com/v3/) or [GraphQL API](https://developer.github.com/v4/). Note that `@octokit/app` does not have methods to send any requests, you will need to use your own request library such as [`@octokit/request`](https://github.com/octokit/request). Alternatively you can use the [`octokit`](https://github.com/octokit/octokit.js) package which comes with everything you need to integrate with any of GitHub’s APIs.

## Usage

<table>
<tbody valign=top align=left>
<tr><th>
Browsers
</th><td width=100%>
Load <code>@octokit/app</code> directly from <a href="https://unpkg.com">unpkg.com</a>
        
```html
<script type="module">
import { App } from "https://unpkg.com/@octokit/app";
</script>
```

</td></tr>
<tr><th>
Node
</th><td>

Install with <code>npm install @octokit/app</code>

```js
const { App } = require("@octokit/app");
// or: import { App } from "@octokit/app";
```

</td></tr>
</tbody>
</table>

## Authenticating as an App

In order to authenticate as a GitHub App, you need to generate a Private Key and use it to sign a JSON Web Token (jwt) and encode it. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/).

Here is how the code looks like with the deprecated `@octokit/app` package.

```js
const { App } = require("@octokit/app");

const app = new App({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
});
const jwt = app.getSignedJsonWebToken();
```

To achive the same with [`@octokit/auth-app`](https://github.com/octokit/auth-app.js/#readme), do the following

```js
const { createAppAuth } = require("@octokit/auth-app");
const { request } = require("@octokit/request");

const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
});
auth({ type: "app" }).then((authentication) => {
  const jwt = authentication.token;
});
```

## Authenticating as an Installation

Once you have authenticated as a GitHub App, you can use that in order to request an installation access token. Calling `requestToken()` automatically performs the app authentication for you. See also the [GitHub Developer Docs](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#authenticating-as-an-installation).

Here is how the code looks like with the deprecated `@octokit/app` package.

```js
const { App } = require("@octokit/app");
const { request } = require("@octokit/request");

const APP_ID = 1; // replace with your app ID
const PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----\n..."; // replace with contents of your private key. Replace line breaks with \n

const app = new App({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY
});
await app.getInstallationAccessToken({
  installationId: process.env.INSTALLATION_ID
}).then(installationAccessToken => {
  // https://developer.github.com/v3/issues/#create-an-issue
  await request("POST /repos/:owner/:repo/issues", {
    headers: {
      authorization: `token ${installationAccessToken}`,
    },
    mediaType: {
      previews: ["machine-man"]
    },
    owner: "hiimbex",
    repo: "testing-things",
    title: "My installation’s first issue"
  });
})
```

To achive the same with [`@octokit/auth-app`](https://github.com/octokit/auth-app.js/#readme), do the following

```js
const { createAppAuth } = require("@octokit/auth-app");
const { request } = require("@octokit/request");

const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: process.env.INSTALLATION_ID
})

auth({ type: "installation" }).then(authentication => {
  const installationAccessToken = authentication.token

  // https://developer.github.com/v3/issues/#create-an-issue
  await request("POST /repos/:owner/:repo/issues", {
    headers: {
      authorization: `token ${installationAccessToken}`
    },
    mediaType: {
      previews: ["machine-man"]
    }
    owner: "hiimbex",
    repo: "testing-things",
    title: "My installation’s first issue"
  });
})
```

Or utilizing the [request hook API](https://github.com/octokit/request.js#authentication)

```js
const { createAppAuth } = require("@octokit/auth-app");
const { request } = require("@octokit/request");

const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  installationId: process.env.INSTALLATION_ID,
});

const requestWithAuth = request.defaults({
  request: {
    hook: auth.hook,
  },
  mediaType: {
    previews: ["machine-man"],
  },
});

// https://developer.github.com/v3/issues/#create-an-issue
await requestWithAuth("POST /repos/:owner/:repo/issues", {
  owner: "hiimbex",
  repo: "testing-things",
  title: "My installation’s first issue",
});
```

## Caching installation tokens

Installation tokens expire after an hour. By default, each `App` instance is caching up to 15000 tokens simultaneously using [`lru-cache`](https://github.com/isaacs/node-lru-cache). You can pass your own cache implementation by passing `options.cache.{get,set}` to the constructor.

Here is how the code looks like with the deprecated `@octokit/app` package.

```js
const { App } = require("@octokit/app");

const CACHE = {};

const app = new App({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  cache: {
    get(key) {
      return CACHE[key];
    },
    set(key, value) {
      CACHE[key] = value;
    },
  },
});
```

`options.cache` is the same for [`@octokit/auth-app`](https://github.com/octokit/auth-app.js/#readme)'s `createAppAuth(options)`

```js
const { createAppAuth } = require("@octokit/auth-app");

const CACHE = {};

const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  cache: {
    get(key) {
      return CACHE[key];
    },
    set(key, value) {
      CACHE[key] = value;
    },
  },
});
```

## Using with GitHub Enterprise

The `baseUrl` option can be used to override default GitHub's `https://api.github.com`:

```js
const app = new App({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  baseUrl: "https://github-enterprise.com/api/v3",
});
```

The same option exist for [`@octokit/auth-app`](https://github.com/octokit/auth-app.js/#readme)'s `createAppAuth(options)`

```js
const auth = createAppAuth({
  id: process.env.APP_ID,
  privateKey: process.env.PRIVATE_KEY,
  cache: {
    get(key) {
      return CACHE[key];
    },
    set(key, value) {
      CACHE[key] = value;
    },
  },
});
```

## License

[MIT](LICENSE)
