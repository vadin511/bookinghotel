'use client';
import { useEffect, useState } from 'react';
import {UserRegisterPayload } from '@/app/model/user'
import { useUser } from '../User/user';
import { redirect } from 'next/dist/server/api-utils';


export default function UsersPage() {
  const [users, setUsers] = useState<UserRegisterPayload[]>([]);
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
