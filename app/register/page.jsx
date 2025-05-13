"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import bgLogin from "../../public/assets/images/bgLogin.png";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOTP] = useState("");
  const [step, setStep] = useState("register");
  const router = useRouter();

  const checkPasswordStrength = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (checkPasswordStrength(password)) {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      console.log(data);

      if (data.step === "otp") {
        alert(data.message);
        setStep("otp");
      }
      setMessage(data.message || "Đăng ký thành công");
    } else {
      alert("Mật khẩu quá yếu");
    }
  };

  const handleVerifyOTP = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message);
      router.push("/login");
    }
  };

  return (
    <div className="grid place-items-center m-0 h-screen bg-[#1e142c] font-['Poppins'] text-[#f9f8fa] overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <Image
          src={bgLogin}
          alt="Background Register"
          fill
          className="object-cover"
        />
      </div>

      {/* Register form */}
      <div className="relative z-[2] bg-[rgb(6_5_7/25%)] backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[40px] h-auto w-[380px] px-6 py-10 flex flex-col gap-5 items-center justify-center text-center">
        <div>
          <p className="text-3xl">Welcome to SAM SON</p>
          <p>Tạo tài khoản mới để bắt đầu</p>
        </div>

        {step === "register" && (
          <form onSubmit={handleRegister} className="grid gap-3 w-full">
            <input
              type="text"
              placeholder="Tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-14 pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] placeholder:text-[#d5d3d2] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] placeholder:text-[#d5d3d2] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300"
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-14 pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] placeholder:text-[#d5d3d2] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300"
              required
            />
            <button
              type="submit"
              className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg cursor-pointer hover:bg-[#251f16] transition-colors duration-300"
            >
              Đăng ký
            </button>
            {message && (
              <p className="text-sm text-green-400 text-center">{message}</p>
            )}
          </form>
        )}

        {step === "otp" && (
          <div className="w-full grid gap-4">
            <input
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Nhập mã OTP"
              className="w-full h-14 pl-5 rounded-lg bg-[#6f5b47] outline-none text-[#f9f8fa] placeholder:text-[#d5d3d2] focus:shadow-[0_0_0_2px_#2c1c0d] transition-all duration-300"
            />
            <button
              onClick={handleVerifyOTP}
              className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg cursor-pointer hover:bg-[#251f16] transition-colors duration-300"
            >
              Xác nhận OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
