"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../components/common/footer/Footer";
import Header from "../../components/common/header/Header";
import ContactForm from "../../components/common/ContactForm";
import { fetchUserProfile, selectUser, selectUserStatus } from "../../app/store/features/userSlice";

function HomeLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus);

  useEffect(() => {
    // Fetch user profile khi component mount (chỉ fetch một lần nếu chưa có user và status là idle)
    if (!user && status === 'idle') {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user, status]);

  useEffect(() => {
    // Kiểm tra và redirect admin về trang admin
    if (user && user.role === "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <ContactForm />
    </>
  );
}

export default HomeLayout;
