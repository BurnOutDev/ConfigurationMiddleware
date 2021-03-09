import React from 'react'
import { Link } from 'react-router-dom'

import { accountService, alertService } from '../../services'
import { Button, Card, Col, Form, Input, Row, Select, Space, Typography } from 'antd'

const Register = ({ history }) => {
    const [submitting, setSubmitting] = React.useState()

    const onSubmit = (fields) => {
        accountService.register({ ...fields, acceptTerms: true })
            .then(() => {
                alertService.success('Registration successful, please check your email for verification instructions', { keepAfterRouteChange: true })
                history.push('login')
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
                    <Form onFinish={onSubmit}
                        labelCol={{ span: 12 }}
                        wrapperCol={{ span: 14 }}
                        layout="horizontal"
                        labelAlign="left">
                        <h3 className="card-header">Register</h3>
                        <Form.Item label='First Name' name='firstName' rules={[{ required: true, message: 'First Name is required' }]}>
                            <Input type='text' />
                        </Form.Item>
                        <Form.Item label='Last Name' name='lastName' rules={[{ required: true, message: 'Last Name is required' }]}>
                            <Input type='text' />
                        </Form.Item>
                        <Form.Item label='Email' name='email' rules={[{ required: true, message: 'Please input your email!' }, { message: 'Email format is not correct!', type: 'email' }]}>
                            <Input inputMode='email' />
                        </Form.Item>
                        <Form.Item label='Password' name='password' rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
                            <Input.Password autoComplete='new-password' />
                        </Form.Item>
                        <Form.Item label='Confirm Password' name='confirmPassword' rules={[]}>
                            <Input.Password autoComplete='new-password' />
                        </Form.Item>
                        <Form.Item label='Starting Balance' name='balance' rules={[]}>
                            <Input type="number" />
                        </Form.Item>
                        <Form.Item>
                            <Button loading={submitting} htmlType='submit'>Save</Button>
                        </Form.Item>
                        <Form.Item>
                            <Link to="login" className="btn btn-link">I already have an account</Link>
                        </Form.Item>
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

export { Register }