'use client';
import { useState } from 'react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

  
    const handleLogin = async () => {
        
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      

      alert(data.message)
      if(data.access){

        window.location.href = '/dashboard';
      }
    };
  

    
    return (
      <div>
          <>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            <button onClick={handleLogin}>Đăng nhập</button>
          </>
  
      </div>
    );
  };
  export default LoginPage