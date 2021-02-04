import React from 'react'
import { Table, Input, Button, Space, Modal, message, Form } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { ControlledEditor as MonacoEditor } from '@monaco-editor/react'
import { fetchWrapper, useSetState } from '../../helpers'
import config from '../../config'

const DataList = () => {
  //#region state constants

  const [state, setState] = useSetState({
    searchText: '',
    searchedColumn: '',
    data: [],
    editorVisible: false,
    selectedRecord: null,
    newApp: { displayName: '', code: '' },
    addNewVisible: false,
  })

  // const [searchText, setSearchText] = React.useState('')
  //   , [searchedColumn, setSearchedColumn] = React.useState('')
  //   , [data, setData] = React.useState([])
  //   , [editorVisible, setEditorVisible] = React.useState(false)
  //   , [selectedRecord, setSelectedRecord] = React.useState(null)
  //   , [newApp, setNewApp] = React.useState({ displayName: '', code: '' })
  //   , [addNewVisible, setAddNewVisible] = React.useState(false)

  //#endregion

  let searchInput = React.createRef()
  let newForm = React.createRef()

  React.useEffect(() => getData(), [])

  const getData = async () => {
    let response = await fetchWrapper.get(`${config.apiUrl}/api/ClientConfiguration/ClientApplications`)
    let data = response.data.map((x, index) => ({ ...x, configuration: JSON.stringify(x.configuration, null, 4), key: index }))
    setState({ data: data })
  }

  const getColumnSearchProps = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={ref => searchInput = ref}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select(), 100)
      }
    },
    render: text =>
      state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
          text
        ),
  })

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm()

    setState({ searchText: selectedKeys[0] })
    setState({ searchedColumn: dataIndex })
  }

  const handleReset = clearFilters => {
    clearFilters()
    setState({ searchText: '' })
  }

  const handleEdit = (record) => {
    // debugger
    setState({ selectedRecord: record })
    setState({ editorVisible: true })
  }

  const columns = [
    {
      title: 'Application',
      dataIndex: 'displayName',
      key: 'displayName',
      width: '30%',
      ...getColumnSearchProps('displayName'),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
      ...getColumnSearchProps('code'),
    },
    {
      title: 'Configuration',
      dataIndex: 'configuration',
      key: 'configuration',
      width: '20%',
      render: (text, record) => (
        <Space size="middle">
          <Button type="default" shape="round" icon={<EditOutlined />} onClick={() => handleEdit(record)} >Edit</Button>
          {/* <Button type="primary" shape="round" icon={<FundViewOutlined />} >View</Button> */}
        </Space>
      ),
    }
  ]

  const handleOk = (record, s) => {
    return fetchWrapper.post(`${config.apiUrl}/api/ClientConfiguration/EditConfigurationByCode/${record.code}`, JSON.parse(record.configuration))
      .then(() => getData())
      .then(() => setState({ editorVisible: false }))
      .then(() => message.success('Configuration saved successfully.', 3))
  }

  const handleNewOk = () => {
    newForm.submit()
    // debugger
    return false
  }

  const handleNewCancel = () => {
    setState({ addNewVisible: false })
    setState({ newApp: { code: '', displayName: '' } })
    newForm.resetFields()
  }

  const handleNewOkSuccess = () => {
    return fetchWrapper.post(`${config.apiUrl}/api/ClientConfiguration/AddClientApplication`, state.newApp)
      .then(() => newForm.resetFields())
      .then(() => getData())
      .then(() => setState({ selectedRecord: state.newApp }))
      .then(() => setState({ editorVisible: true }))
      .then(() => setState({ addNewVisible: false }))
      .then(() => setState({ newApp: { code: '', displayName: '' } }))
  }

  return <>
    <Space style={{ padding: 10, paddingLeft: 0 }}>
      <Button type="default" size="large" icon={<PlusOutlined />} onClick={() => setState({ addNewVisible: true })}>Add New</Button>
    </Space>
    <Table columns={columns} dataSource={state.data} />
    <Modal
      title={state.selectedRecord?.code}
      visible={state.editorVisible}
      onCancel={() => setState({ editorVisible: false })}
      onOk={(s) => handleOk(state.selectedRecord, s)}
      width={600}
    >
      {state.selectedRecord
        && <MonacoEditor
          height={400}
          language="json"
          theme="vs-light"
          value={state.selectedRecord.configuration}
          options={{ selectOnLineNumbers: true }}
          onChange={(_, value) => setState({ selectedRecord: { ...state.selectedRecord, configuration: value } })}
        />}
    </Modal>

    <Modal
      title="Add New Application"
      visible={state.addNewVisible}
      onCancel={handleNewCancel}
      onOk={handleNewOk}
      width={600}
      okText="Save and edit configuration"
    >
      <Form
        ref={ref => newForm = ref}
        name="basic"
        requiredMark="optional"
        layout="vertical"
        onFinish={handleNewOkSuccess}
      // onFinish={onFinish}
      // onFinishFailed={onFinishFailed}
      >
        <Form.Item
          label="Display Name"
          name="displayName"
          rules={[{ required: true, message: 'Please enter display name for application.' }]}
        >
          <Input value={state.newApp.displayName} onChange={e => setState({ newApp: { ...state.newApp, displayName: e.target.value } })} />
        </Form.Item>

        <Form.Item
          label="Code"
          name="code"
          rules={[{ required: true, message: 'Please enter code for application.' }]}
        >
          <Input value={state.newApp.code} onChange={e => setState({ newApp: { ...state.newApp, code: e.target.value } })} />
        </Form.Item>
      </Form>
    </Modal>
  </>
}

export default DataList