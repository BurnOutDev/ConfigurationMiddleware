import React from 'react'
import { Switch } from 'react-router-dom'

import { accountService } from '../../services'
import { Navbar } from '..'
import { Layout } from 'antd'

const { Content, Footer } = Layout

const WithNavbar = ({ content }) => {
    const [user, setUser] = React.useState({})

    React.useEffect(() => { accountService.user.subscribe(x => setUser(x)) }, [])

    return (
        <Switch>
            <Layout>
                {user && <Navbar />}
                <Content style={{ padding: '0 50px', marginTop: 64 }}>
                    {content}
                </Content>
                {/* <Footer>
                </Footer> */}
            </Layout>
        </Switch>
    )
}

export { WithNavbar }