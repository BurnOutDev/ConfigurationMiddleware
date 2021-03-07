import config from '../config'
import { fetchWrapper, history } from '../helpers'
import { HubConnectionBuilder } from '@aspnet/signalr'
import { accountService } from '.'
import { HubConnectionState } from '@aspnet/signalr'

//#region Connection

const connection = new HubConnectionBuilder()
  .withUrl('https://localhost:5001/kline', {
    accessTokenFactory: () => accountService.userValue.jwtToken
  })
  .build()

//#endregion

const baseUrl = `${config.apiUrl}/api/bet`

const placeBet = (amount, isRiseOrFall) => {
  if (gamblingService.connection.state === HubConnectionState.Connected)
    return gamblingService.connection
      .stop()
      .then(() => gamblingService.connection.start())
      .then(() => {
        return connection
          .invoke('RegisterConnection')
          .then(() =>
            fetchWrapper
              .post(`${baseUrl}`, { amount, isRiseOrFall })
              .catch((err) => console.error(err))
          )
      })
  else
    return gamblingService.connection.start().then(() => {
      return connection
        .invoke('RegisterConnection')
        .then(() =>
          fetchWrapper
            .post(`${baseUrl}`, { amount, isRiseOrFall })
            .catch((err) => console.error(err))
        )
    })
}

export const gamblingService = {
  placeBet,
  connection
}
