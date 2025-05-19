"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import bgLogin from "../../../public/assets/images/bgLogin.png";
import { loginUser, selectLoginStatus } from "../../store/features/userSlice";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const loginStatus = useSelector(selectLoginStatus);

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
        alert(resultAction.payload.message);
        resetForm();
        window.location.href = "/";
      } else if (loginUser.rejected.match(resultAction)) {
        alert(resultAction.payload || "Đăng nhập thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại");
    }
  };

  return (
    <div className="relative p-10 grid place-items-center text-[#f9f8fa] ">
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
      <div className=" z-[2] bg-[rgb(6_5_7/25%)]  backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[40px] h-[500px] w-[380px] flex flex-col gap-5 items-center justify-center text-center">
        {/* <img src="" alt="Logo" className="w-[74px] mb-8" /> */}
        <div>
          <p className="text-3xl">
            <b>
              {" "}
              <span className="text-[#2c1c0d]"> Welcome to </span> SAM SON
            </b>
          </p>
          <p> Rất vui khi được bạn biết đến !</p>
        </div>

        <div>
          <form className="grid gap-3 w-76 " onSubmit={handleLogin}>
            {/* Email Field */}
            <div className=" relative">
              <input
                required
                value={email}
                onChange={handleChange}
                type="email"
                id="email-input"
                placeholder="Email"
                className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${email ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              />
            </div>

            <div className=" relative">
              <input
                required
                type="password"
                id="password-input"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${password ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              />
            </div>

            <button
              type="submit"
              disabled={loginStatus === 'loading'}
              className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg cursor-pointer relative overflow-hidden hover:bg-[#251f16] transition-colors duration-300"
            >
              {loginStatus === 'loading' ? 'Đang đăng nhập...' : 'Login'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-5">
          <Link
            href=""
            className="text-[#b1aca9] text-[17px] hover:text-[#f9f9f9]"
          >
            Quên mật khẩu ?
          </Link>
          <p className=" text-[17px]">
            Bạn chưa có tài khoản ?{" "}
            <Link
              href={"/register"}
              className="text-[#b98c70] text-[17px] hover:text-[#f9f9f9]"
            >
              Sign up!
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;