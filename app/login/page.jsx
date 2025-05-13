"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import bgLogin from "../../public/assets/images/bgLogin.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const resetForm = () => {
    setEmail("");
    setPassword("");
    console.log("Form reset");
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
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      alert(data.message);

      if (data.access) {
        resetForm();
        console.log(resetForm(), "Form reset");
        router.push("/dashboard");
      
        
      }
      
    } catch (error) {
      console.error("Login error:", error);
      alert("Đăng nhập thất bại");
    }
  };
  return (
    <div className="grid place-items-center m-0 h-screen bg-[#1e142c] font-['Poppins'] text-[#f9f8fa] overflow-hidden">
      {/* Background waves animation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <Image
          src={bgLogin}
          alt="Background login"
          fill
          className="object-cover"
        />
      </div>

      {/* Login form */}
      <div className="login relative z-[2] bg-[rgb(6_5_7/25%)] backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[40px] h-[500px] w-[380px] flex flex-col gap-5 items-center justify-center text-center">
        {/* <img src="" alt="Logo" className="w-[74px] mb-8" /> */}
        <div>
          <p className="text-3xl"><b> <span className="text-[#2c1c0d]"> Welcome to </span> SAM SON</b></p>
          <p> Rất vui khi được bạn biết đến !</p>
        </div>

        <form className="grid gap-3 w-76 mb-8" onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="textbox relative">
            <input
              required
              value={email}
              onChange={handleChange}
              type="email"
              id="email-input"
              placeholder="Email"
              className="w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300 "
            />
          </div>

          <div className="textbox relative">
            <input
              required
              type="password"
              id="password-input"
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={handleChange}
              className="w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300 "
            />
          </div>

          <button
            type="submit"
            className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg cursor-pointer relative overflow-hidden hover:bg-[#251f16] transition-colors duration-300"
          >
            Login
          </button>
        </form>

        <div className="flex flex-col gap-10">
          <a
            href="#"
            className="text-[#b1aca9] text-[17px] mb-14 hover:text-[#f9f9f9]"
          >
          Quên mật khẩu ?
          </a>
          <p className=" mt-14 text-[17px]">
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
