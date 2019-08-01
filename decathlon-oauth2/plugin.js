import authStore from './store'

/*eslint-disable */
const OPTS = <%= serialize(options) %>
/*eslint-enable */

const STORE_NAMESPACE = 'auth'

const LOGIN_ENDPOINT = '/login'
const LOGOUT_ENDPOINT = '/logout'

export default function ({ store, redirect }, inject) {
  if (!store) {
    console.error('Vuex is required !')
    return
  }

  store.registerModule(STORE_NAMESPACE, authStore, {
    preserveState: Boolean(store.state[STORE_NAMESPACE])
  })

  inject('auth', {
    state: store.state[STORE_NAMESPACE],
    login: (from) => {
      // TODO : manage `from`
      return process.server ? redirect(LOGIN_ENDPOINT) : location.assign(LOGIN_ENDPOINT)
    },
    logout: (from) => {
      // TODO : manage `from`
      return process.server ? redirect(LOGOUT_ENDPOINT) : location.assign(LOGOUT_ENDPOINT)
    }
  })
}
