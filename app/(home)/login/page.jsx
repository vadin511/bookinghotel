"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import bgLogin from "../../../public/assets/images/bgLogin.png";
import { loginUser, selectLoginStatus, resetLoginStatus } from "../../store/features/userSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginStatus = useSelector(selectLoginStatus);
  const redirectUrl = searchParams.get("redirect");

  // Reset login status when component mounts (when navigating back to login page)
  useEffect(() => {
    dispatch(resetLoginStatus());
  }, [dispatch]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
  };

  const handleChange = (e) => {
    e.preventDefault();
    const { value, type } = e.target;
    if (type === "email") {
      setEmail(value);
    } else if (type === "password") {
      setPassword(value);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const resultAction = await dispatch(loginUser({ email, password }));
      
      if (loginUser.fulfilled.match(resultAction)) {
        toast.success(resultAction.payload.message);
        resetForm();
        
        // Nếu có redirect URL, quay về trang đó
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (resultAction.payload.role === "user") {
          router.push("/"); 
        } else if (resultAction.payload.role === "admin") {
          router.push("/admin"); 
        }
        
      } else if (loginUser.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || "Đăng nhập thất bại";
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error("Đăng nhập thất bại");
    }
  };


  return (
    <div className="relative p-10 grid place-items-center text-[#f9f8fa]">
      {/* Background waves animation */}
      <div className="absolute top-0 left-0 w-full h-full">
        <Image
          src={bgLogin}
          alt="Background login"
          fill
          className="object-cover"
        />
      </div>

      {/* Login form */}
      <div className="z-[2] bg-[rgba(6,5,7,0.25)] backdrop-blur-[38px] shadow-[0_40px_30px_rgba(0,0,0,0.1)] rounded-[40px] h-[500px] w-[380px] flex flex-col gap-5 items-center justify-center text-center">
        <div>
          <p className="text-4xl">
            <b>
              <span className="text-[#2c1c0d]">Chào mừng đến với </span>VadiGo
            </b>
          </p>
          <p className="text-lg">Rất vui được gặp bạn!</p>
        </div>

        <div>
          <form className="grid gap-3 w-76" onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="relative">
              <input
                required
                value={email}
                onChange={handleChange}
                type="email"
                id="email-input"
                placeholder="Email"
                className={`w-full h-14 pl-5 rounded-lg text-[#f9f8fa] outline-none focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300 ${
                  email ? "bg-[#E8F0FE] text-black" : "bg-[#6f5b47]"
                }`}
              />
            </div>

            <div className="relative">
              <input
                required
                type="password"
                id="password-input"
                autoComplete="new-password"
                placeholder="Mật khẩu"
                value={password}
                onChange={handleChange}
                className={`w-full h-14 pl-5 rounded-lg text-[#f9f8fa] outline-none focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300 ${
                  password ? "bg-[#E8F0FE] text-black" : "bg-[#6f5b47]"
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={loginStatus === 'loading'}
              className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-xl cursor-pointer relative overflow-hidden hover:bg-[#251f16] transition-colors duration-300"
            >
              {loginStatus === 'loading' ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <Link
            href=""
            className="text-[#b1aca9] text-lg hover:text-[#f9f9f9]"
          >
            Quên mật khẩu?
          </Link>
          <p className="text-lg">
            Chưa có tài khoản?{" "}
            <Link
              href={"/register"}
              className="text-[#b98c70] text-lg hover:text-[#f9f9f9]"
            >
              Đăng ký ngay!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
