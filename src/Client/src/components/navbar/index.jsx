import React from 'react'
import { Menu } from 'antd'
import { UnorderedListOutlined, LogoutOutlined, UserOutlined, UsergroupAddOutlined, ProfileOutlined } from '@ant-design/icons'
import { accountService } from '../../services'
import { Link, useLocation } from 'react-router-dom'
import { useSetState } from '../../helpers'

const { Item, SubMenu } = Menu

const nav = {
    apps: '/applications',
    users: '/admin/users'
}

const Navbar = () => {
    const history = useLocation()

    const [state, setState] = useSetState({
        current: history.pathname,
        userName: `${accountService.userValue?.firstName} ${accountService.userValue?.lastName}`
    })

    return (
        <Menu onClick={e => setState({ current: e.key })} selectedKeys={[state.current]} style={{ padding: '0 50px' }} mode="horizontal">
            <Item key={nav.apps} icon={<UnorderedListOutlined />}>
                <Link to={nav.apps}>Applications</Link>
            </Item>

            <Item key={nav.users} icon={<UsergroupAddOutlined />}>
                <Link to={nav.users}>Users</Link>
            </Item>

            <SubMenu title={state.userName} style={{ float: 'right' }} icon={<UserOutlined />}>
                {/* <Item key="profile" icon={<ProfileOutlined />}>Profile</Item> */}
                <Item key="logout" icon={<LogoutOutlined />} onClick={accountService.logout}>Logout</Item>
            </SubMenu>
        </Menu>
    )
}

export { Navbar }