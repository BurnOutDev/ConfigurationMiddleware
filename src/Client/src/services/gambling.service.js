import config from '../config'
import { fetchWrapper, history } from '../helpers'
import { HubConnectionBuilder } from '@aspnet/signalr'

//#region Connection

const connection = new HubConnectionBuilder()
  .withUrl('https://localhost:5001/kline', {
    accessTokenFactory: () => localStorage.getItem('token')
  })
  .build()

//#endregion

const baseUrl = `${config.apiUrl}/api/bet`

const placeBet = (amount, isRiseOrFall) => {
  return connection
    .invoke('RegisterConnection')
    .then(() =>
      fetchWrapper
        .post(`${baseUrl}`, { amount, isRiseOrFall })
        .catch((err) => console.error(err))
    )
}

export const gamblingService = {
  placeBet,
  connection
}
