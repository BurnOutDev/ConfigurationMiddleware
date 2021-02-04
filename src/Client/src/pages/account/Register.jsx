import React from 'react'
import { Link } from 'react-router-dom'

import { accountService, alertService } from '../../services'
import { Button, Form, Input, Select } from 'antd'

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
        <Form onFinish={onSubmit}>
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
            <Form.Item>
                <Button loading={submitting} htmlType='submit'>Save</Button>
            </Form.Item>
            <Form.Item>
                <Link to="login" className="btn btn-link">Cancel</Link>
            </Form.Item>
        </Form>
    )
}

export { Register } 