'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOTP] = useState('');
  const [step, setStep] = useState<'register' | 'otp'>('register');
  
  const checkPasswordStrength = (password: string) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if(checkPasswordStrength(password)){
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name ,email , password }),
        
      });
      const data = await res.json();
      console.log(data);
      
      if (data.step === 'otp') {
       alert(data.message)
        setStep('otp');
      }
      setMessage(data.message || 'Đăng ký thành công');
    }else{
      alert("Mật khẩu quá yếu")
    }
  };
  const handleVerifyOTP = async () => {
    const res = await fetch('/api/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert(data.message)
      window.location.href = '/login';
    }
  };
  return (
    <div>
    {step === 'register' && (
     <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
     <h2 className="text-xl font-bold mb-4">Đăng ký người dùng</h2>
     <form onSubmit={handleRegister} className="space-y-4">
     <input
         type="text"
         placeholder="Nhập tên của bạn"
         value={name}
         onChange={(e) => setName(e.target.value)}
         className="w-full p-2 border rounded"
         required
       />
        <input
       type="text"
       placeholder="Nhập email"
       value={email}
       onChange={(e) => setEmail(e.target.value)}
       className="w-full p-2 border rounded"
       required
     /> 
     <input
     type="text"
     placeholder="password"
     value={password}
     onChange={(e) => setPassword(e.target.value)}
     className="w-full p-2 border rounded"
     required
   />
       <button
         type="submit"
         className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
       >
         Đăng ký
       </button>
     </form>
     {message && <p className="mt-4 text-green-600">{message}</p>}
   </div>
    )}

    {step === 'otp' && (
      <>
        <input value={otp} onChange={e => setOTP(e.target.value)} placeholder="Nhập mã OTP" />
        <button onClick={handleVerifyOTP}>Xác nhận OTP</button>
      </>
    )}
  </div>
    
  );
}
