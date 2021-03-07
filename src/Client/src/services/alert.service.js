import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'
import { message } from 'antd'

const alertSubject = new Subject()
const defaultId = 'default-alert'

// duration in seconds
const duration = 3

// enable subscribing to alerts observable
const onAlert = (id = defaultId) => {
    return alertSubject.asObservable().pipe(filter(x => x && x.id === id))
}

// convenience methods
const success = (content) => {
    message.success(content, duration)
}

const error = (content) => {
    message.error(content, duration)
}

const info = (content) => {
    message.info(content, duration)
}

const warn = (content) => {
    message.warning(content, duration)
}

// core alert method
const alert = (alert) => {
    console.warn('ALERT NOT IMPLEMENTED!')
}

// clear alerts
const clear = (id = defaultId) => {
    console.warn('ALERT CLEAR NOT IMPLEMENTED!')
}

export const alertService = {
    onAlert,
    success,
    error,
    info,
    warn,
    alert,
    clear
}
