const consola = require('consola').withScope('decathlon-oauth2:middleware:refresh-token')

module.exports = function ({ strategy, debug }) {
  if (debug) {
    consola.level = 'trace'
  }

  return function (req, res, next) {
    if (!req.user) {
      return next()
    }

    const expiresAt = req.user.expiresAt // milliseconds
    const current = Date.now()

    // if token expires in more that 2 minutes, no refresh
    if (expiresAt - current > (120 * 1000)) {
      return next()
    }

    consola.trace('Expires at', new Date(expiresAt))
    consola.trace('Lets refresh the token !')

    strategy._oauth2.getOAuthAccessToken(req.user.refreshToken, {
      grant_type: 'refresh_token'
    }, (err, accessToken, refreshToken, params) => {
      if (err) {
        consola.error(err)
        req.logout()

        return next(err)
      }

      consola.trace('Successfully refresh the access token !')

      req.login({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresAt: Date.now() + (params.expires_in * 1000)
      }, (error) => {
        if (error) {
          consola.error(error)
          req.logout()

          return next(error)
        }

        next()
      })
    })
  }
}
