import React from 'react'
import { Link } from 'react-router-dom'
import { Col, Row, Card, Form, Checkbox, Input, Space, Typography, Button } from 'antd'

import { accountService, alertService } from '../../services'

const Login = ({ history, location }) => {
    const [submitting, setSubmitting] = React.useState()

    const onSubmit = ({ email, password }) => {
        alertService.clear()
        accountService.login(email, password)
            .then(() => {
                const { from } = location.state || { from: { pathname: "/" } }
                history.push(from)
            })
            .catch(error => {
                setSubmitting(false)
                alertService.error(error)
            })
    }

    return (
        <Row style={{ height: '100vh', alignItems: 'center' }}>
            <Col span={6} offset={9}>
                <Card title={<Title />}>
                    <Form onFinish={onSubmit}>
                        <h3 className="card-header">Login</h3>
                        <div className="card-body">
                            <Form.Item
                                name="email"
                                rules={[{ required: true, message: 'Please input your email!' }, { message: 'Email format is not correct!', type: 'email' }]}
                            >
                                <Input placeholder='Email' inputMode='email' />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                rules={[{ required: true, message: 'Please input your password!' }]}
                            >
                                <Input.Password placeholder="Password" />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={submitting} block>Login</Button>
                            </Form.Item>
                            <Form.Item>
                                <Link to="register" className="btn btn-link">Register new account</Link>
                            </Form.Item>
                        </div>
                    </Form>
                </Card>
            </Col>
        </Row>
    )
}

const Title = () => (
    <Space direction='vertical' align='center' style={{ width: '100%' }}>
        <Typography.Title style={{ fontSize: 24 }}>Crypto Battle</Typography.Title>
    </Space>
)

export { Login }