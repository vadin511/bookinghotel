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
    dispatch(fetchUserProfile());
  }, [dispatch]);

useEffect(() => {
  if (user && user.role_id !== "admin") {
    router.push("/login");
  }
}, [user]);


 

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
