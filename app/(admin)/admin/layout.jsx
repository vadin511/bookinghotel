'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile, selectUser } from "../../../app/store/features/userSlice";
import Header from "../../../components/admin/header/Header";
import Sidebar from "../../../components/admin/sidebar/Sidebar";

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelector(selectUser);

  useEffect(() => {
    // Chỉ fetch user profile một lần khi mount
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]); // Chỉ chạy khi dispatch thay đổi

  useEffect(() => {
    // Kiểm tra user sau khi đã fetch
    if (user === null) {
      // User đã được fetch nhưng null, có thể token hết hạn
      // Không làm gì ở đây, để fetchUserProfile tự xử lý refresh
      return;
    }
    
    if (user && user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);


 

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
