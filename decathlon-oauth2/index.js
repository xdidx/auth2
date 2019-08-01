const path = require('path')
const dktOAuth2 = require('./serverMiddleware')

const DEFAULT_AUTHORIZATION_URL = 'https://api-eu.decathlon.net/connect/oauth/authorize'
const DEFAULT_TOKEN_URL = 'https://api-eu.decathlon.net/connect/oauth/token'
const DEFAULT_USERINFO_URL = 'https://api-eu.decathlon.net/connect/oauth/userinfo'
const DEFAULT_CALLBACK_URL = '/auth/callback'

const DEFAULT_REDIS_URL = 'redis://localhost:6379'

module.exports = function (moduleOptions) {
  const options = {
    oauth2: {
      authorizationURL: DEFAULT_AUTHORIZATION_URL,
      tokenURL: DEFAULT_TOKEN_URL,
      callbackURL: DEFAULT_CALLBACK_URL,
      userinfoURL: DEFAULT_USERINFO_URL,
      ...moduleOptions.oauth2
    },
    session: moduleOptions.session,
    redis: {
      url: DEFAULT_REDIS_URL,
      ...moduleOptions.redis
    }
  }

  // put our middleware a first, to handle
  // authentication before every other middlewares
  this.options.serverMiddleware.unshift({
    path: '/',
    handler: dktOAuth2(options)
  })

  // copy required file(s)
  this.addTemplate({
    src: path.resolve(__dirname, 'store/index.js'),
    fileName: './@nuxt-springboard/auth/store.js'
  })

  // Register plugin
  this.addPlugin({
    src: path.resolve(__dirname, 'plugin.js'),
    fileName: './@nuxt-springboard/auth/plugin.js',
    options: moduleOptions
  })

  // Register middlewares
  this.addPlugin({
    src: path.resolve(__dirname, 'middlewares/authenticated.js'),
    fileName: './@nuxt-springboard/auth/middlewares/authenticated.js'
  })
}

module.exports.meta = require('./package.json')
