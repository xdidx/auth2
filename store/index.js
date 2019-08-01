import Vue from 'vue'

const INIT = 'init'
const SET = 'set'
const LOGOUT = ' logout'

// initial state
const state = () => ({})

// actions
const actions = {
  [INIT] ({ commit }, payload) {
    if (payload) {
      commit(SET, payload)
    }
  },

  [LOGOUT] ({ commit }) {
    // TODO perform request to /logout
    // await axios.post('/logout')
    commit(SET, null)
  }
}

// mutations
const mutations = {
  [SET] (state, payload) {
    Vue.set(state, 'accessToken', payload.accessToken)
    Vue.set(state, 'expiresAt', payload.expiresAt)

    // define a more explicit boolean attribut
    Vue.set(state, 'loggedIn', !!payload.accessToken)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
