'use client';
import { useEffect, useState } from 'react';

type User = {
  email: string;
  id: number;
  name: string;
  password:String
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);
  console.log(users);
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Danh sách người dùng</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id} className="border-b py-1">
            {user.name}
            <br />
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
