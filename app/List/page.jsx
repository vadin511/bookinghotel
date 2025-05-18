/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '../user/page';


export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const {user} = useUser()
  if(user){
    console.log(user);
    
  } 
  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);
  
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Người dùng hiện tại</h1>
        {user ? 
      <div>
          <p>{user.name}</p>
          <span>{user.email}</span>
      </div>
        :""}
    </div>
  );
}
