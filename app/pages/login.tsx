import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Input, Card, Space, Modal } from 'antd';
import axios from 'axios';

export default function Login() {
  //
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  //
  const router = useRouter();

  //
  useEffect(() => {
    let token = localStorage.getItem('token');
    if (token === null) {
      router.replace("/login");
    }
  }, [router]);

  const onClick = () => {
    if(username === '' || password === '') {
      Modal.error({
        title: 'Username or Password cannot be empty',
        className: 'modal-center',
      });
      return;
    }
    //
    axios
    .post(process.env.NEXT_PUBLIC_API + 'login', {
      username: username,
      password: password
    })
    .then((result) => {
      const data = result.data.data;
      console.log(data);
      if(!data.result) {
        setUsername('');
        setPassword('');
        Modal.error({
          title: 'Error',
          content: 'Username or Password invalid',
          className: 'modal-center',
        });
        return;
      }
      localStorage.setItem('token', data.token)
      router.replace('/')
      return;
    })
    .catch((e) => {
      setUsername('');
      setPassword('');
      Modal.error({
        title: 'Error',
        content: e.message,
        className: 'modal-center',
      });
      return;
    });
  };

  //
  return (
    <Card className='x-card' style={{margin: 'auto', marginTop: 100}}>
      <div>
        <h2>Internet User Account</h2>
      </div>
      <Space direction='vertical' style={{width: '100%'}}>
        <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder='Username' size='large' />
        <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} placeholder='Password' size='large' />
        <Button
          type="primary"
          onClick={() => onClick()}
          style={{width: '100%', marginTop: 10}}
          size='large'
        >
          Login
        </Button>
      </Space>
    </Card>
  )
}
