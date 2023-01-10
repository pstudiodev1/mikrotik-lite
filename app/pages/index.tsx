import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import axios from 'axios';

import { 
  Layout, 
  Modal, 
  Row, 
  Col, 
  Table, 
  Space, 
  Button, 
  Divider, 
  Input, 
  Select,
  Upload,
} from 'antd';

export default function Index() {
  //
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);

  const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [debugDeleteText, setDebugDeleteText] = useState('');

  const [isModalOpenImport, setIsModalOpenImport] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState('student');

  let listDelete: any[];

  const props: UploadProps = {
    name: 'file',
    action: process.env.NEXT_PUBLIC_API + 'import',
    headers: {
      authorization: '',
    },
    onChange(info) {
      // setIsModalOpenImport(false);
      // loadUsers();
    },
  };

  interface DataType {
    id: string,
    name: string;
    password: number;
    profile: string;
  }
  const columns: ColumnsType<DataType> = [
    { title: 'Username', dataIndex: 'name', key: 'name' },
    { title: 'Password', dataIndex: 'password', key: 'password' },
    { title: 'Profile', dataIndex: 'profile', key: 'profile' },
    { title: 'Action', dataIndex: '', key: 'x', render: (txt, rec, i) => <a onClick={() => handleDelete(rec.id)}>Delete</a> },
  ];

  //
  const router = useRouter();

  //
  useEffect(() => {
    let token = localStorage.getItem('token');
    if (token === null) {
      router.replace("/login");
      return;
    }
  }, [router]);

  //
  const loadUsers = () => {
    setLoading(true);
    setDataSource([]);
    axios
    .get(process.env.NEXT_PUBLIC_API + 'users', {
      headers: {
        authorization: localStorage.getItem('token')
      }
    })
    .then((result) => {
      if(!result.data.data.result) {
        if(result.data.error.description === 'Not authorize') {
          router.replace('/login');
          return;
        }

        Modal.error({
          title: 'Error',
          content: result.data.error.description,
          className: 'modal-center',
        });
        return;
      }

      let items = result.data.data.items.filter((i: { name: string; }) => i.name != 'default-trial');
      setLoading(false);
      setDataSource(items);
    })
    .catch((e) => {
      Modal.error({
        title: 'Error',
        content: e.message,
        className: 'modal-center',
      });
      return;
    });
  }

  //
  const searchUsername = () => {
    if(search === '') {
      loadUsers();
      return;
    }

    let items = dataSource.filter((i: { name: string; }) => i.name.indexOf(search) > -1);
    setDataSource(items);
    setSearch('');
  }

  //
  const showModalAddUser = () => {
    setUsername('');
    setPassword('');
    setProfile('student');
    setIsModalOpenAdd(true);
  };

  //
  const showModalImport = () => {
    setIsModalOpenImport(true);
  };

  //
  const handleOkAdd = () => {
    setIsModalOpenAdd(false);
    axios
      .post(process.env.NEXT_PUBLIC_API + 'users/add', {
        name: username,
        password: password,
        profile: profile,
      }, {
        headers: {
          authorization: localStorage.getItem('token')
        }
      })
      .then((result) => {
        if(!result.data.data.result) {  
          Modal.error({
            title: 'Error',
            content: result.data.error.description,
            className: 'modal-center',
          });
          return;
        }
        loadUsers();
      })
      .catch((e) => {
        Modal.error({
          title: 'Error',
          content: e.message,
          className: 'modal-center',
        });
        return;
      })
  };

  //
  const handleCancelAdd = () => {
    setIsModalOpenAdd(false);
  };

  //
  const handleChangeProfile = (value: string) => {
    console.log(value);
    setProfile(value);
  };

  //
  const handleDelete = (id: string) => {
    axios
      .delete(process.env.NEXT_PUBLIC_API + 'users/' + id, {
        headers: {
          authorization: localStorage.getItem('token')
        }
      })
      .then((result) => {
        // loadUsers();
        let tmp = dataSource.filter((i: { id: string; }) => i.id != id);
        setDataSource(tmp);
      })
      .catch((e) => {
        Modal.error({
          title: 'Error',
          content: e.message,
          className: 'modal-center',
        });
        return;
      });
  }

  //
  const deleteUser = (id: string, name: string) => {
    setDebugDeleteText('Deleting ' + name);
    axios
      .delete(process.env.NEXT_PUBLIC_API + 'users/' + id, {
        headers: {
          authorization: localStorage.getItem('token')
        }
      })
      .then((result) => {
        if(!result.data.data.result) {  
          console.log(result.data);
          setIsModalOpenDelete(false);
          loadUsers();
          return;
        }

        listDelete = listDelete.filter((i: { id: string; }) => i.id != id);

        if(listDelete.length <= 0) {
          setIsModalOpenDelete(false);
          setTimeout(() => loadUsers(), 1000)
          return;
        }

        setTimeout(() => {
          deleteUser(listDelete[0]['id'], listDelete[0]['name']);
        }, 1000);
      })
      .catch((e) => {
        console.log(e);
        return;
      });
  }

  //
  const handleDeleteAll = () => {
    if(dataSource.length === 0) {
      Modal.error({
        title: 'Error',
        content: 'No items to be deleted',
        className: 'modal-center',
      });
      return;
    }

    listDelete = dataSource;
    setIsModalOpenDelete(true);
    deleteUser(listDelete[0]['id'], listDelete[0]['name']);
  }

  //
  const logout = () => {
    localStorage.removeItem('token');
    router.replace('/login');
  }

  //
  const download = () => {
    axios
      .get(process.env.NEXT_PUBLIC_API + 'export', {
        headers: {
          authorization: localStorage.getItem('token')
        }
      })
      .then((result) => {
        if(!result.data.result) {
          console.log(result.data);
          return;
        }
        window.open(process.env.NEXT_PUBLIC_API + 'download/' + result.data.file, '_blank')
        return;
      })
      .catch((e) => {
        Modal.error({
          title: 'Error',
          content: e.message,
          className: 'modal-center',
        });
        return;
      });
  }

  //
  const handleOkImport = () => {
    setIsModalOpenImport(false);
  };

  //
  return (
    <>
      {/* 
      Delete mutiple users
      */}
      <Modal title="Deleteing" open={isModalOpenDelete} footer={[]}>
        <Divider />
        {debugDeleteText}
        <Divider />
      </Modal>
      
      {/* 
      Add a user
      */}
      <Modal title="Add user" open={isModalOpenAdd} onOk={handleOkAdd} onCancel={handleCancelAdd}>
        <Space direction='vertical' style={{width: '100%'}}>
          <Divider />
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' size='large' />
          <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' size='large' />
          <Select
            defaultValue="student"
            style={{width: '100%'}}
            onChange={handleChangeProfile}
            size='large'
            options={[
              {
                value: 'student',
                label: 'Student',
              },
              {
                value: 'teacher',
                label: 'Teacher',
              },
            ]}
          />
          <Divider />
        </Space>
      </Modal>
      
      {/* 
      Import users by excle file
      */}
      <Modal title="Import excel file" open={isModalOpenImport} footer={[
        <Button key={'ok'} type="primary" onClick={() => handleOkImport()}>OK</Button>
      ]}>
        <Space direction='vertical' style={{width: '100%'}}>
          <Divider />
          <Upload {...props}>
            <Button type="primary">Open excel file</Button>
          </Upload>
          <Divider />
          <span>
            Support only in csv format, example in below<br/>
            - first column, username<br/>
            - second column, password<br/>
            - third column, profile<br/>
          </span>
          <Image src={'/images/import1.png'} alt={''} width={450} height={150}/>
          <Image src={'/images/import2.png'} alt={''} width={450} height={150}/>
          <Divider />
        </Space>
      </Modal>
      {/* 
      //
      // Content
      //
      */}
      <Row justify="center">
        <Col span={6}>
          <h2>User Internet Account</h2>
        </Col>
      </Row>
      <Row>
        <Col span={14}>
          <Space>
            <Button type="primary" onClick={() => loadUsers()} loading={loading}>Refresh</Button>
            {/* <Divider type="vertical" /> */}
            <Button type="primary" onClick={() => showModalAddUser()}>New a user</Button>
            <Button type="primary" onClick={() => showModalImport()}>Import excel file</Button>
            {/* <Divider type="vertical" /> */}
            <Button type="primary" onClick={() => download()}>Download</Button>
            <Divider type="vertical" />
            <Button type="primary" danger onClick={() => handleDeleteAll()}>Delete All</Button>
            {/* <Divider type="vertical" /> */}
            <Button type="primary" danger onClick={() => logout()}>Logout</Button>
          </Space>
        </Col>
        <Col span={10}>
          <Row justify={'end'}>
            <Col>
              <Space>
                <Input 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  placeholder='Search username' 
                  size='large' 
                  style={{width: '100%'}}
                  />
                <Button type="primary" onClick={() => searchUsername()}>Search</Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
      <Divider />
      <Row justify="center">
        <Col span={24}>
          <Table 
            dataSource={dataSource} 
            columns={columns} 
            pagination={{pageSize: 100}}
            size='large'
            />
        </Col>
      </Row>
    </>
  )
}
