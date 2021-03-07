import React from 'react'

import { accountService, alertService } from '../../../services'
import { Form, Input, Select } from 'antd'
import Modal from 'antd/lib/modal/Modal'

const AddEdit = ({ userId, formRef, onClose }) => {

    //#region state

    const [submitting, setSubmitting] = React.useState()

    const [initialValues, setInitialValues] = React.useState({
        firstName: 'Irakli',
        lastName: 'Murusidze',
        email: `iraklimurusidze${Math.random().toString().substr(12)}@live.com`,
        role: 'User',
        password: 'password',
        confirmPassword: 'password'
    })

    const id = userId
    const isAddMode = !id

    //#endregion

    //#region refs

    let form = React.createRef()

    //#endregion

    //#region data

    React.useEffect(() => {
        if (!isAddMode) {
            accountService.getById(id).then(user => {
                setInitialValues(user)
            })
        }
    }, [])

    //#endregion

    //#region effect

    React.useEffect(() => form.resetFields(), [form, initialValues])

    //#endregion

    //#region handlers

    const onSubmit = (fields) => {
        if (isAddMode) {
            createUser(fields, setSubmitting)
        } else {
            updateUser(id, fields, setSubmitting)
        }
    }

    const createUser = (fields, setSubmitting) => {
        accountService.create(fields)
            .then(() => {
                alertService.success('Added successfully.')
                onClose()
            })
            .catch(error => {
                setSubmitting(false)
                alertService.error(error)
            })
    }

    const updateUser = (id, fields, setSubmitting) => {
        accountService.update(id, fields)
            .then(() => {
                alertService.success('Updated successfully.')
                onClose()
            })
            .catch(error => {
                setSubmitting(false)
                alertService.error(error)
            })
    }

    //#endregion

    return (
        <Form
            ref={ref => {
                form = ref
                formRef(ref)
            }}
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
            {!isAddMode &&
                <div>
                    <h3 className="pt-3">Change Password</h3>
                    <p>Leave blank to keep the same password</p>
                </div>
            }
            <Form.Item label='Password' name='password' rules={[{ required: isAddMode, message: 'Password is required' }, { min: 6, message: 'Password must be at least 6 characters' }]}>
                <Input.Password autoComplete='new-password' />
            </Form.Item>
            <Form.Item label='Confirm Password' name='confirmPassword' rules={[]}>
                <Input.Password autoComplete='new-password' />
            </Form.Item>
        </Form>
    )
}

const DataModal = ({ visible, userId, onCancel, title }) => {

    let form = React.createRef()

    const submit = () => form.submit()

    const cancel = () => onCancel()

    const close = () => onCancel()

    return (
        <Modal
            title={title}
            visible={visible}
            onCancel={cancel}
            onOk={submit}
            width={600}
            okText="Done">
            <AddEdit
                userId={userId}
                formRef={ref => form = ref}
                onClose={close} />
        </Modal>
    )
}

export { DataModal as AddEdit }