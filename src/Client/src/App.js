import React from 'react'
import { Route, Switch, Redirect, useLocation } from 'react-router-dom'

import { Role } from './helpers'
import { accountService } from './services'
import { PrivateRoute, Profile, WithNavbar } from './components'
import { Account, Admin, Gambling, Home } from './pages'

const App = () => {
  const { pathname } = useLocation()
  const [user, setUser] = React.useState({})

  React.useEffect(() => { accountService.user.subscribe(x => setUser(x)) }, [])

  return (
    <Switch>
      <Redirect from="/:url*(/+)" to={pathname.slice(0, -1)} />
      <Redirect exact from='/' to="/gambling" />
      <Route path="/account" component={Account} />
      <WithNavbar content={<>
        <PrivateRoute exact path="/gambling" component={Gambling} />
        <PrivateRoute path="/profile" component={Profile} />
        <PrivateRoute path="/admin" roles={[Role.Admin]} component={Admin} />
      </>} />
      <Redirect from="*" to="/" />
    </Switch>
  )
}

export default App