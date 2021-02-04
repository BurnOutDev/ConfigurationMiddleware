import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Select } from 'antd'

import { accountService, alertService } from '../../services'

function Update({ history }) {
    const user = accountService.userValue
    const initialValues = {
        title: user.title,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        confirmPassword: ''
    }

    function onSubmit(fields, { setStatus, setSubmitting }) {
        setStatus()
        accountService.update(user.id, fields)
            .then(() => {
                alertService.success('Update successful', { keepAfterRouteChange: true })
                history.push('.')
            })
            .catch(error => {
                setSubmitting(false)
                alertService.error(error)
            })
    }

    const confirm = () => true

    const [isDeleting, setIsDeleting] = useState(false)
    function onDelete() {
        if (confirm('Are you sure?')) {
            setIsDeleting(true)
            accountService.delete(user.id)
                .then(() => alertService.success('Account deleted successfully'))
        }
    }

    return (
        <Form
            // ref={ref => {
            //     form = ref
            //     formRef(ref)
            // }}
            onFinish={onSubmit}
            initialValues={initialValues}
            layout='vertical'
            onInvalid={(e) => console.log(e)}>
            <Form.Item label='First Name' name='firstName' rules={[{ required: true, message: 'First Name is required' }]}>
                <Input type='text' />
            </Form.Item>
            <Form.Item label='Last Name' name='lastName' rules={[{ required: true, message: 'Last Name is required' }]}>
                <Input type='text' />
            </Form.Item>
            <Form.Item label='Email' name='email' rules={[{ required: true, message: 'Please input your email!' }, { message: 'Email format is not correct!', type: 'email' }]}>
                <Input inputMode='email' />
            </Form.Item>
            <Form.Item label='Role' name='role' rules={[{ required: true, message: 'Role is required' }]}>
                <Select>
                    <Select.Option></Select.Option>
                    <Select.Option value='User' children='User' />
                    <Select.Option value='Admin' children='Admin' />
                </Select>
            </Form.Item>
            <div>
                <h3 className="pt-3">Change Password</h3>
                <p>Leave blank to keep the same password</p>
            </div>
            <Form.Item label='Password' name='password' rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
                <Input.Password autoComplete='new-password' />
            </Form.Item>
            <Form.Item label='Confirm Password' name='confirmPassword' rules={[]}>
                <Input.Password autoComplete='new-password' />
            </Form.Item>
        </Form>
    )
}

export { Update }