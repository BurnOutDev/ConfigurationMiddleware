import React from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { Link } from 'react-router-dom'
import { accountService, alertService } from '../../services'

const Update = ({ history }) => {
    const [submitting, setSubmitting] = React.useState()
    const [isDeleting, setIsDeleting] = React.useState(false)
    const [confirmVisible, setConfirmVisible] = React.useState(false)

    const user = accountService.userValue

    const onSubmit = (fields) => {
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

    const onDelete = () => {
        setIsDeleting(true)
        accountService.delete(user.id)
            .then(() => alertService.success('Account deleted successfully'))
    }

    return (
        <Form>
            <h1>Update Profile</h1>
            <Form.Item label='First Name' rules={[{ required: true, message: 'First Name is required' }]}>
                <Input name='firstName' type='text' />
            </Form.Item>
            <Form.Item label='Last Name' rules={[{ required: true, message: 'Last Name is required' }]}>
                <Input name='lastName' type='text' />
            </Form.Item>
            <Form.Item label='Email' rules={[{ required: true, message: 'Please input your email!' }, { message: 'Email format is not correct!', type: 'email' }]}>
                <Input name='email' inputMode='email' />
            </Form.Item>
            <h3 className="pt-3">Change Password</h3>
            <p>Leave blank to keep the same password</p>
            <Form.Item label='Password' rules={[{ required: true, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
                <Input.Password name='password' />
            </Form.Item>
            <Form.Item label='Confirm Password' rules={[]}>
                <Input.Password name='confirmPassword' />
            </Form.Item>
            <Form.Item>
                <Button loading={submitting}>Save</Button>
            </Form.Item>
            <Form.Item>
                <Button loading={isDeleting} onClick={() => setConfirmVisible(true)}>Delete</Button>
            </Form.Item>
            <Form.Item>
                <Link to="." className="btn btn-link">Cancel</Link>
            </Form.Item>
            <Modal
                title="Basic Modal"
                visible={confirmVisible}
                onOk={onDelete}
                onCancel={() => setConfirmVisible(false)}
            >Are you sure?</Modal>
        </Form >
    )
}

export { Update }