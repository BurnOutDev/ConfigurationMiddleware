import React from 'react'
import { Menu } from 'antd'
import { UnorderedListOutlined, LogoutOutlined, UserOutlined, UsergroupAddOutlined, ProfileOutlined } from '@ant-design/icons'
import { accountService } from '../../services'
import { Link, useLocation } from 'react-router-dom'
import { useSetState } from '../../helpers'
import { gamblingService } from '../../services/gambling.service'

const { Item, SubMenu } = Menu

const nav = {
    apps: '/gambling',
    users: '/admin/users'
}

const Navbar = () => {
    const history = useLocation()

    const [state, setState] = useSetState({
        current: history.pathname,
        userName: `${accountService.userValue?.firstName} ${accountService.userValue?.lastName}`,
        balance: 0
    })

    React.useEffect(() => {
        accountService.getBalance().then((bal) => setState({ balance: bal }))

        gamblingService.connection.on('BalanceUpdated', message => {
            setState({ balance: message.amount })
        })
    }, [])

    return (
        <Menu onClick={e => setState({ current: e.key })} selectedKeys={[state.current]} style={{ padding: '0 50px' }} mode="horizontal">
            <Item key={nav.apps} icon={<UnorderedListOutlined />}>
                <Link to={nav.apps}>Crypto Battle</Link>
            </Item>
            <SubMenu title={`Balance: ${state.balance} | ${state.userName}`} style={{ float: 'right' }} icon={<UserOutlined />}>
                {/* <Item key="profile" icon={<ProfileOutlined />}>Profile</Item> */}
                <Item key="logout" icon={<LogoutOutlined />} onClick={accountService.logout}>Logout</Item>
            </SubMenu>
        </Menu>
    )
}

export { Navbar }