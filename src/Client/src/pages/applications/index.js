import React from 'react'
import { Route, Switch } from 'react-router-dom'

import List from './List'

const Applications = ({ match }) => {
    const { path } = match

    return (
        <Switch>
            <Route path={`${path}/`} component={List} />
        </Switch>
    )
}

export { Applications }