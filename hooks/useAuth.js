'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const useAuth = (allowedRoles = []) => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // ví dụ: 'admin' hoặc 'user'

    if (!token || !allowedRoles.includes(role)) {
      router.replace('/login'); // Hoặc redirect về trang không có quyền
    } else {
      setLoading(false);
    }
  }, []);

  return { loading };
};

export default useAuth;
