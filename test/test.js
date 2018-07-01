const nock = require('nock')
const App = require('/path/to/app')

describe('app.js', function() {
  let app

  beforeEach(function() {
    // set up stuff
    app = new App({
      id: 123, privateKey: 'secrets'
    })
  });
  // test cases

  // Get app installations
  // https://developer.github.com/v3/apps/#find-repository-installation
  it('gets an individual installation', () => {
    nock('https://apps-js-test.com', {
      reqheaders: {
        authorization: `token ${app.appAuth()}`, // jwt: installation ID to auth as an installation
        accept: 'application/vnd.github.machine-man-preview+json'
      }
    })
      .get('/repos/hiimbex/testing-things/installation')
      .reply(200, {})

    return got({owner: 'hiimbex', repo: 'testing-things'})
    // Do I need to use got or another request library here?? or should it be interna;
  })

  // Create an issue on a repository
  // https://developer.github.com/v3/issues/#create-an-issue
  it('creates an issue', () => {
    nock('https://apps-js-test.com', {
      reqheaders: {
        authorization: `token ${app.requestToken()}`, // installation access token
      }
    })
      .post('/repos/hiimbex/testing-things/issues')
      .reply(201, {})

    return got({owner: 'hiimbex', repo: 'testing-things'})
    // Do I need to use got or another request library here?
  })
});
