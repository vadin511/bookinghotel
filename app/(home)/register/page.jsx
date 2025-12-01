"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import bgLogin from "../../../public/assets/images/bgLogin.png";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [otp, setOTP] = useState("");
  const [step, setStep] = useState("register");
  const router = useRouter();
  const dispatch = useDispatch();

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

      if (data.step === "otp") {
        toast.success(data.message);
        setStep("otp");
      }
      setMessage(data.message || "Đăng ký thành công");
    } else {
      toast.error("Mật khẩu quá yếu. Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt");
    }
  };

  const handleVerifyOTP = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.success) {
      toast.success(data.message);
      router.push("/login");
    } else {
      toast.error(data.message || "Xác nhận OTP thất bại");
    }
  };

  return (
    <div className="relative h-screen grid p-4 sm:p-6 md:p-8 lg:p-10 place-items-center bg-[#1e142c] font-['Poppins'] text-[#f9f8fa] overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-screen">
        <Image
          src={bgLogin}
          alt="Background Register"
          fill
          className="object-cover h-full w-full"
        />
      </div>

      {/* Register form */}
      <div className="relative z-[2] bg-[rgb(6_5_7/25%)] backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[20px] sm:rounded-[30px] md:rounded-[40px] h-auto min-h-[400px] sm:min-h-[450px] md:min-h-[500px] w-full max-w-[320px] sm:max-w-[360px] md:max-w-[380px] flex flex-col gap-4 sm:gap-5 items-center justify-center text-center p-6 sm:p-8 md:p-10 overflow-y-auto">
        <div>
          <p className="text-2xl sm:text-3xl md:text-4xl">Chào mừng đến với VadiGo</p>
          <p className="text-base sm:text-lg">Tạo tài khoản mới để bắt đầu</p>
        </div>

        {step === "register" && (
          <form onSubmit={handleRegister} className="grid gap-3 w-76 ">
            <input
              type="text"
              placeholder="Họ tên"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${name ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${email ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${password ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
            />
            <button
              type="submit"
              className="h-12 sm:h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg sm:text-xl cursor-pointer hover:bg-[#251f16] transition-colors duration-300"
            >
              Đăng ký
            </button>
            {message && (
              <p className="text-base text-green-400 text-center">{message}</p>
            )}
          </form>
        )}
        <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
          <p className="text-base sm:text-lg">
            Bạn đã có tài khoản?{" "}
            <Link
              href={"/login"}
              className="text-[#b98c70] text-base sm:text-lg hover:text-[#f9f9f9]"
            >
              Đăng nhập ngay!
            </Link>
          </p>
        </div>

        {step === "otp" && (
          <div className="w-76 grid gap-4">
            <input
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Nhập mã OTP"
              className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${otp ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
            />
            <button
              onClick={handleVerifyOTP}
              className="h-12 sm:h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg sm:text-xl cursor-pointer hover:bg-[#251f16] transition-colors duration-300"
            >
              Xác nhận OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}