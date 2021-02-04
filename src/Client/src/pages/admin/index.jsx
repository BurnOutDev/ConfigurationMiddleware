import React from 'react'
import { Route, Switch } from 'react-router-dom'

import { Users } from './users'

const Admin = ({ match }) => {
    const { path } = match

    return (
        <Switch>
            <Route path={`${path}/users`} component={Users} />
        </Switch>
    )
}

export { Admin }