module.exports = getCache

// https://github.com/isaacs/node-lru-cache#readme
const LRU = require('lru-cache')

function getCache () {
  return new LRU({
    // cache max. 15000 tokens, that will use less than 10mb memory
    max: 15000,
    // Cache for 1 minute less than GitHub expiry
    maxAge: 1000 * 60 * 59
  })
}
