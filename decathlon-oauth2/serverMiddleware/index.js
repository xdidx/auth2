const express = require('express')
const request = require('request')
const expressSession = require('express-session')
const RedisStore = require('connect-redis')(expressSession)
const bodyParser = require('body-parser')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2')
const ProxyAgent = require('proxy-agent')
const consola = require('consola').withScope('decathlon-oauth2:middleware:auth')

const refreshTokenMiddleware = require('./refresh-token')

module.exports = function ({ oauth2, session, redis, debug }) {
  if (debug === undefined) {
    debug = process.env.NODE_ENV !== 'production'
  }

  if (debug) {
    consola.level = 'trace'
  }

  // configure OAuth DKT strategy
  const strategy = new OAuth2Strategy({
    authorizationURL: oauth2.authorizationURL,
    tokenURL: oauth2.tokenURL,
    callbackURL: oauth2.callbackURL,
    ...oauth2
  }, (accessToken, refreshToken, params, _, done) => {
    if (!oauth2.userinfoURL) {
      return done('userinfoURL parameter is required')
    }

    request({
      url: oauth2.userinfoURL,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      json: true,
      gzip: true
    }, (error, response, body) => {
      // request error
      if (error) {
        return done(error)
      }

      if (response.statusCode !== 200) {
        return done(body)
      }

      // success login
      done(null, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: Date.now() + (params.expires_in * 1000)
      })
    })
  })

  // adds proxy support
  strategy._oauth2.setAgent(new ProxyAgent(process.env.HTTPS_PROXY || process.env.HTTP_PROXY))

  // prepares passport to use our strategy and express-session
  passport.use(strategy)
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))

  /**
   * Router configuration
   */
  const router = express.Router()

  router.use(expressSession({
    store: new RedisStore(redis),
    ...session
  }))
  router.use(bodyParser.urlencoded({
    extended: false
  }))
  router.use(passport.initialize())
  router.use(passport.session())

  // refresh token middleware
  router.use(refreshTokenMiddleware({
    strategy: strategy,
    debug: debug
  }))

  // auth routes
  router.get('/login',
    passport.authenticate('oauth2', {
      scope: oauth2.scopes
    })
  )

  const relativeCallbackURL = '/' + oauth2.callbackURL.replace(/^(?:\/\/|[^/]+)*\//, '')
  router.get(relativeCallbackURL,
    passport.authenticate('oauth2', {
      successRedirect: oauth2.redirect.success,
      failureRedirect: oauth2.redirect.failure
    })
  )

  router.get('/logout', (req, res) => {
    req.logout()
    res.redirect(oauth2.redirect.logout)
  })

  return router
}
