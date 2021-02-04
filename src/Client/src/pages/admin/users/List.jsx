import React from 'react'
import { Table, Input, Button, Space, Popconfirm } from 'antd'
import Highlighter from 'react-highlight-words'
import { SearchOutlined, EditOutlined, PlusOutlined, UserDeleteOutlined } from '@ant-design/icons'
import { useSetState } from '../../../helpers'
import { accountService, alertService } from '../../../services'
import { AnimatedIconButton } from '../../../components/animated-icon-button'
import { AddEdit } from './AddEdit'

const List = () => {
  
  //#region state

  const [state, setState] = useSetState({
    searchText: '',
    searchedColumn: '',
    data: [],
    editorVisible: false,
    selectedRecord: null,
    addNewVisible: false
  })

  //#endregion

  //#region refs

  let searchInput = React.createRef()
  let newForm = React.createRef()

  //#endregion

  //#region data

  React.useEffect(() => getData(), [])

  const getData = async () => {
    let response = await accountService.getAll()
    let data = response.map((x, index) => ({ ...x, name: `${x.firstName} ${x.lastName}`, key: index }))
    setState({ data })
  }

  //#endregion

  //#region helpers data filtering

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

  //#endregion

  //#region handlers

  const handleEdit = (record) => {
    setState({ selectedRecord: record })
    setState({ editorVisible: true })
  }

  const deleteUser = (record) => {
    accountService.delete(record.id)
      .then(getData)
      .catch(error => {
        alertService.error(error)
      })
  }

  //#endregion

  //#region columns

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '20%',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: '10%',
      ...getColumnSearchProps('role'),
    },
    {
      title: 'Actions',
      width: '20%',
      render: (text, record) => (
        <Space size="middle">
          <AnimatedIconButton type='default' icon={<EditOutlined />} onClick={() => handleEdit(record)} text='Edit' />
          <Popconfirm placement="top" title='Are you sure?' onConfirm={() => deleteUser(record)} okText="Yes" cancelText="No">
            <AnimatedIconButton type='danger' icon={<UserDeleteOutlined />} text='Delete' />
          </Popconfirm>
        </Space>
      ),
    }
  ]

  //#endregion

  return <>
    <Space style={{ padding: 10, paddingLeft: 0 }}>
      <Button type="default" size="large" icon={<PlusOutlined />} onClick={() => setState({ addNewVisible: true })}>Add New</Button>
    </Space>
    <Table columns={columns} dataSource={state.data} />
    {state.selectedRecord
      && <AddEdit
        userId={state.selectedRecord.id}
        visible={state.editorVisible}
        onCancel={() => setState({ editorVisible: false })}
        title='Edit User'
      />}

    <AddEdit
      visible={state.addNewVisible}
      onCancel={() => setState({ addNewVisible: false })}
      title='Add User'
    />
  </>
}

export { List }