import { Button, Form, Input } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'

import { accountService, alertService } from '../../services'

const ForgotPassword = () => {
    const [submitting, setSubmitting] = React.useState()

    const onSubmit = ({ email }) => {
        alertService.clear()
        accountService.forgotPassword(email)
            .then(() => alertService.success('Please check your email for password reset instructions'))
            .catch(error => alertService.error(error))
            .finally(() => setSubmitting(false))
    }

    return (
        <Form onFinish={onSubmit}>
            <h3 className="card-header">Forgot Password</h3>
            <Form.Item label='Email' rules={[{ required: true, message: 'Please input your email!' }, { message: 'Email format is not correct!', type: 'email' }]}>
                <Input name='email' inputMode='email' />
            </Form.Item>
            <Form.Item>
                <Button loading={submitting}>Save</Button>
            </Form.Item>
            <Form.Item>
                <Link to="login" className="btn btn-link">Cancel</Link>
            </Form.Item>
        </Form>
    )
}

export { ForgotPassword }