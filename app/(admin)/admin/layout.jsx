'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, selectUser, selectUserStatus } from "../../../app/store/features/userSlice";
import Header from "../../../components/admin/header/Header";
import Sidebar from "../../../components/admin/sidebar/Sidebar";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus);

  useEffect(() => {
    // Chỉ fetch user profile một lần khi mount
    if (!user && status === 'idle') {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user, status]);

  useEffect(() => {
    // Chờ cho đến khi fetch hoàn tất (không phải đang loading hoặc idle)
    if (status === 'loading' || status === 'idle') {
      return;
    }

    // Nếu fetch thất bại hoặc user null sau khi fetch thành công, redirect về login
    if (status === 'failed' || (status === 'succeeded' && !user)) {
      router.push("/login");
      return;
    }
    
    // Kiểm tra role admin
    if (user && user.role !== "admin") {
      router.push("/login");
    }
  }, [user, status, router]);


 

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
