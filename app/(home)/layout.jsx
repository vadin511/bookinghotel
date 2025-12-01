"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Footer from "../../components/common/footer/Footer";
import Header from "../../components/common/header/Header";
import ContactForm from "../../components/common/ContactForm";
import { fetchUserProfile, selectUser } from "../../app/store/features/userSlice";

function HomeLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  useEffect(() => {
    // Fetch user profile khi component mount
    dispatch(fetchUserProfile());
  }, [dispatch]);

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
