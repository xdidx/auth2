# Decathlon OAuth2

Nuxtjs module to use DktConnect OAuth2 authentication.

## Installation

```sh
npm i -S @nuxt-modules/decathlon-oauth2  --registry http://nexus3.osiris.withoxylane.com/repository/JSCorp/
```

## Requirements

- Your application as to be served by an Express server (@see https://nuxtjs.org/examples/auth-routes#using-express-and-sessions)
- Redis server (to store sessions)
- Vuex store

## Usage

In `nuxt.config.js`

```js
modules: [
  ...,
  ['@nuxt-modules/decathlon-oauth2', {
    oauth2: {
      clientID: process.env.DKT_CONNECT_CLIENT_ID,
      clientSecret: process.env.DKT_CONNECT_CLIENT_SECRET,
      callbackURL: process.env.DKT_CONNECT_CLIENT_REDIRECT_URL,
      scopes: ['openid', 'profile', 'email'],
      redirect: {
        success: '/user/profile',
        failure: '/login',
        logout: '/'
      }
    },
    session: {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1 * 24 * 3600 * 1000 // 1 day
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      logErrors: true
    }
  }],
  ...
]
```

You need to dispatch an `auth/init` event to store the authentication data in the Vuex store.

In `store/index.js`

```js
const createStore = () => {
  return new Vuex.Store({
    ...,
    actions: {
      async nuxtServerInit ({ dispatch }, { app, req, store }) {
        // init auth store
        dispatch('auth/init', req.user)

        ...
      }
    }
  ...
  }
```

**/!\ As it's session based authentication, you have to send credentials in ajax requests, if you want to get `accessToken` from `req.user` object (in express middleware for example)**

An example using Axios library :
```js
axios
  .get(`${env.API_URL}api/v1/sports`, {
    withCredentials: true
  })
  .then(res => res.data)
```

## Options

### oauth2

| name             | type   | required | default                                                    | description |
|------------------|--------|----------|------------------------------------------------------------|-------------|
| authorizationURL | string | false    | https://api-eu.decathlon.net/connect/oauth/authorize       |             |
| tokenURL         | string | false    | https://api-eu.decathlon.net/connect/oauth/token           |             |
| callbackURL      | string | false    | /auth/callback                                             |             |
| userinfoURL      | string | false    | https://api-eu.decathlon.net/connect/oauth/userinfo        |             |
| clientID         | string | true     |                                                            |             |
| clientSecret     | string | true     |                                                            |             |
| scopes           | array  | false    |                                                            |             |
| redirect         | object | true     |                                                            |             |

### session

See [express-session](https://github.com/expressjs/session) documentation

### redis

Default :

```js
redis: {
  url: 'redis://localhost:6379'
}
```

See [connect-redis](https://github.com/tj/connect-redis) documentation


## Vuex store

The module set date in `auth` store module. You can easily access to the module state through `this.$auth.state`.

| name        | type    | description                             |
|-------------|---------|-----------------------------------------|
| accessToken | string  | OAuth2 access token                     |
| expiresAt   | string  | OAuth2 access token expiration date     |
| loggedIn    | boolean | Logged in status (based on accessToken) |

## Generated routes

This module automatically creates the following routes :

| route          | description                                                |
|----------------|------------------------------------------------------------|
| /login         | Start login process                                        |
| /logout        | Start logout process                                       |
| /auth/callback | Callback OAuth2 route based on `oauth2.callbackURL` option |

## Nuxt usage (and SSR general purposes)

To easily handle credentials during SSR, you can simply use [@nuxtjs/axios](https://axios.nuxtjs.org/) to perform yout ajax requests. It automaticaly adds credentials in both SSR and classic ajax request and manage headers correctly. It also provide an easy way to manage token through a `setToken` method.

## `$auth` service

An auth service is automaticaly injected during module initialization, with the following content :

| methods     | arguments | description                                |
|-------------|-----------|--------------------------------------------|
| login       | from      | start login process                        |
| logout      | from      | start logout process (reset cookies, etc.) |

| attributes  | description                                |
|-------------|--------------------------------------------|
| state       | Vuex auth module                           |

## FAQ


