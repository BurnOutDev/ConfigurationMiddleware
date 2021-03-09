import { BehaviorSubject } from 'rxjs'

import config from '../config'
import { fetchWrapper, history } from '../helpers'
import { gamblingService } from './gambling.service'
import { HubConnectionState } from '@aspnet/signalr'

const userSubject = new BehaviorSubject(null)
const baseUrl = `${config.apiUrl}/accounts`

const login = (email, password) => {
  return fetchWrapper
    .post(`${baseUrl}/authenticate`, { email, password })
    .then((user) => {
      // publish user to subscribers and start timer to refresh token
      userSubject.next(user)
      localStorage.setItem('token', user.accessToken)
      startRefreshTokenTimer()
      return user
    })
    .then(() => {
      if (gamblingService.connection.state === HubConnectionState.Connected)
        return gamblingService.connection
          .stop()
          .then(() => gamblingService.connection.start())
      else return gamblingService.connection.start()
    })
}

const logout = () => {
  // revoke token, stop refresh timer, publish null to user subscribers and redirect to login page
  fetchWrapper.post(`${baseUrl}/revoke-token`, {})
  stopRefreshTokenTimer()
  userSubject.next(null)
  localStorage.removeItem('token')
  history.push('/account/login')
}

const refreshToken = () => {
  return fetchWrapper.post(`${baseUrl}/refresh-token`, {}).then((user) => {
    // publish user to subscribers and start timer to refresh token
    userSubject.next(user)
    startRefreshTokenTimer()
    return user
  })
}

const register = (params) => {
  return fetchWrapper.post(`${baseUrl}/register`, params)
}

const verifyEmail = (token) => {
  return fetchWrapper.post(`${baseUrl}/verify-email`, { token })
}

const forgotPassword = (email) => {
  return fetchWrapper.post(`${baseUrl}/forgot-password`, { email })
}

const validateResetToken = (token) => {
  return fetchWrapper.post(`${baseUrl}/validate-reset-token`, { token })
}

const resetPassword = ({ token, password, confirmPassword }) => {
  return fetchWrapper.post(`${baseUrl}/reset-password`, {
    token,
    password,
    confirmPassword
  })
}

const getAll = () => {
  return fetchWrapper.get(baseUrl)
}

const getById = (id) => {
  return fetchWrapper.get(`${baseUrl}/${id}`)
}

const getBalance = () => {
  return fetchWrapper.get(`${baseUrl}/GetBalance`)
}

const create = (params) => {
  return fetchWrapper.post(baseUrl, params)
}

const update = (id, params) => {
  return fetchWrapper.put(`${baseUrl}/${id}`, params).then((user) => {
    // update stored user if the logged in user updated their own record
    if (user.id === userSubject.value.id) {
      // publish updated user to subscribers
      user = { ...userSubject.value, ...user }
      userSubject.next(user)
    }
    return user
  })
}

// prefixed with underscore because 'delete' is a reserved word in javascript
const _delete = (id) => {
  return fetchWrapper.delete(`${baseUrl}/${id}`).then((x) => {
    // auto logout if the logged in user deleted their own record
    if (id === userSubject.value.id) {
      logout()
    }
    return x
  })
}

// helper functions

let refreshTokenTimeout

const startRefreshTokenTimer = () => {
  // parse json object from base64 encoded jwt token
  const jwtToken = JSON.parse(atob(userSubject.value.jwtToken.split('.')[1]))

  // set a timeout to refresh the token a minute before it expires
  const expires = new Date(jwtToken.exp * 1000)
  const timeout = expires.getTime() - Date.now() - 60 * 1000
  refreshTokenTimeout = setTimeout(refreshToken, timeout)
}

const stopRefreshTokenTimer = () => clearTimeout(refreshTokenTimeout)

export const accountService = {
  login,
  logout,
  refreshToken,
  register,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  user: userSubject.asObservable(),
  get userValue() {
    return userSubject.value
  },
  getBalance
}
