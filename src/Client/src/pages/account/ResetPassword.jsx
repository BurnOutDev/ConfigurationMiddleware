import React from 'react'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import { Button, Form, Input } from 'antd'

import { accountService, alertService } from '../../services'

const ResetPassword = ({ history }) => {
    const [submitting, setSubmitting] = React.useState()

    const TokenStatus = {
        Validating: 'Validating',
        Valid: 'Valid',
        Invalid: 'Invalid'
    }

    const [token, setToken] = React.useState(null)
    const [tokenStatus, setTokenStatus] = React.useState(TokenStatus.Validating)

    React.useEffect(() => {
        const { token } = queryString.parse(window.location.search)

        // remove token from url to prevent http referer leakage
        history.replace(window.location.pathname)

        accountService.validateResetToken(token)
            .then(() => {
                setToken(token)
                setTokenStatus(TokenStatus.Valid)
            })
            .catch(() => {
                setTokenStatus(TokenStatus.Invalid)
            })
    }, [])

    const getForm = () => {
        const onSubmit = ({ password, confirmPassword }) => {
            alertService.clear()
            accountService.resetPassword({ token, password, confirmPassword })
                .then(() => {
                    alertService.success('Password reset successful, you can now login', { keepAfterRouteChange: true })
                    history.push('login')
                })
                .catch(error => {
                    setSubmitting(false)
                    alertService.error(error)
                })
        }

        return (
            <Form onFinish={onSubmit}>
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
                    <Link to="login" className="btn btn-link">Cancel</Link>
                </Form.Item>
            </Form>
        )
    }

    const getBody = () => {
        switch (tokenStatus) {
            case TokenStatus.Valid:
                return getForm()
            case TokenStatus.Invalid:
                return <div>Token validation failed, if the token has expired you can get a new one at the <Link to="forgot-password">forgot password</Link> page.</div>
            case TokenStatus.Validating:
                return <div>Validating token...</div>
            default: return null
        }
    }

    return (
        <div>
            <h3 className="card-header">Reset Password</h3>
            <div className="card-body">{getBody()}</div>
        </div>
    )
}

export { ResetPassword } 