"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import bgLogin from "../../../public/assets/images/bgLogin.png";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOTP] = useState("");
  const [step, setStep] = useState("register");
  const [errors, setErrors] = useState({});
  const [otpError, setOtpError] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const checkPasswordStrength = (password) => {
    const regex =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = "Họ tên không được để trống";
    } else if (name.trim().length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }
    
    // Validate email
    if (!email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate password
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!checkPasswordStrength(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateRegisterForm()) {
      return;
    }

    const res = await fetch("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (data.step === "otp") {
      setStep("otp");
      setErrors({});
    } else if (data.error) {
      // Handle API errors
      if (data.error.includes("Email") || data.error.includes("email")) {
        setErrors({ ...errors, email: data.error });
      } else {
        setErrors({ ...errors, email: data.error });
      }
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setOtpError("Mã OTP không được để trống");
      return;
    }

    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.success) {
      router.push("/login");
    } else {
      setOtpError(data.message || "Xác nhận OTP thất bại");
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
            <div className="relative">
              <input
                type="text"
                placeholder="Họ tên"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) {
                    setErrors({ ...errors, name: "" });
                  }
                }}
                className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                  focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                  ${name ? "bg-[#E8F0FE] text-black" : ""}
                  ${errors.name ? "border-2 border-red-500" : ""}
                  transition-all duration-300`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 text-left">{errors.name}</p>
              )}
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: "" });
                  }
                }}
                className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                  focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                  ${email ? "bg-[#E8F0FE] text-black" : ""}
                  ${errors.email ? "border-2 border-red-500" : ""}
                  transition-all duration-300`}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 text-left">{errors.email}</p>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: "" });
                  }
                }}
                className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                  focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                  ${password ? "bg-[#E8F0FE] text-black" : ""}
                  ${errors.password ? "border-2 border-red-500" : ""}
                  transition-all duration-300`}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 text-left">{errors.password}</p>
              )}
            </div>
            <button
              type="submit"
              className="h-12 sm:h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg sm:text-xl cursor-pointer hover:bg-[#251f16] transition-colors duration-300"
            >
              Đăng ký
            </button>
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
            <div className="relative">
              <input
                value={otp}
                onChange={(e) => {
                  setOTP(e.target.value);
                  if (otpError) {
                    setOtpError("");
                  }
                }}
                placeholder="Nhập mã OTP"
                className={`w-full h-12 sm:h-14 !pl-4 sm:!pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none text-sm sm:text-base
                  focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                  ${otp ? "bg-[#E8F0FE] text-black" : ""}
                  ${otpError ? "border-2 border-red-500" : ""}
                  transition-all duration-300`}
                required
              />
              {otpError && (
                <p className="text-red-500 text-sm mt-1 text-left">{otpError}</p>
              )}
            </div>
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