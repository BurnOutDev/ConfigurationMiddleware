import config from '../config'
import { accountService } from '../services'

const get = (url) => {
    const requestOptions = {
        method: 'GET',
        headers: authHeader(url)
    }
    return fetch(url, requestOptions).then(handleResponse)
}

const post = (url, body) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(url) },
        credentials: 'include',
        body: JSON.stringify(body)
    }
    return fetch(url, requestOptions).then(handleResponse)
}

const put = (url, body) => {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(url) },
        body: JSON.stringify(body)
    }
    return fetch(url, requestOptions).then(handleResponse)    
}

// prefixed with underscored because delete is a reserved word in javascript
const _delete = (url) => {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(url)
    }
    return fetch(url, requestOptions).then(handleResponse)
}

// helper functions

const authHeader = (url) => {
    // return auth header with jwt if user is logged in and request is to the api url
    const user = accountService.userValue
    const isLoggedIn = user && user.jwtToken
    const isApiUrl = url.startsWith(config.apiUrl)
    if (isLoggedIn && isApiUrl) {
        return { Authorization: `Bearer ${user.jwtToken}` }
    } else {
        return {}
    }
}

const handleResponse = (response) => {
    return response.text().then(text => {
        debugger
        const data = text && JSON.parse(text)
        
        if (!response.ok) {
            if ([401, 403].includes(response.status) && accountService.userValue) {
                // auto logout if 401 Unauthorized or 403 Forbidden response returned from api
                accountService.logout()
            }

            let error = (data && data.message) || response.statusText

            return Promise.reject(error)
        }

        return data
    })
}

export const fetchWrapper = {
    get,
    post,
    put,
    delete: _delete
}