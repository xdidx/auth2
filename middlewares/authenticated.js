import Middleware from '../../../middleware'

const LOGIN_ENDPOINT = '/login'

Middleware['authenticated'] = function ({ store, redirect }) {
  // If the user is not authenticated
  if (!store.state.auth.loggedIn) {
    return process.server ? redirect(LOGIN_ENDPOINT) : location.assign(LOGIN_ENDPOINT)
  }
}
