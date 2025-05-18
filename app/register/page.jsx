"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import bgLogin from "../../public/assets/images/bgLogin.png";

export default function RegisterPage() {
  const [full_name, setFull_Name] = useState("");
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
        body: JSON.stringify({ full_name, email, password }),
      });
      const data = await res.json();

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message);
      router.push("/login");
    }
  };

  return (
    <div className=" relative grid p-10 place-items-center bg-[#1e142c] font-['Poppins'] text-[#f9f8fa]">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <Image
          src={bgLogin}
          alt="Background Register"
          fill
          className="object-cover"
        />
      </div>

      {/* Register form */}
      <div className="relative z-[2] bg-[rgb(6_5_7/25%)] backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[40px] h-[500px] w-[380px] flex flex-col gap-5 items-center justify-center text-center">
        <div>
          <p className="text-3xl">Welcome to SAM SON</p>
          <p>Tạo tài khoản mới để bắt đầu</p>
        </div>

        {step === "register" && (
          <form onSubmit={handleRegister} className="grid gap-3 w-76 ">
            <input
              type="text"
              placeholder="Tên của bạn"
              value={full_name}
              onChange={(e) => setFull_Name(e.target.value)}
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${full_name ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
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
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${password ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
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
        <div className="flex flex-col gap-10">
          <p className=" text-[17px]">
            Bạn đã có tài khoản rồi ?{" "}
            <Link
              href={"/login"}
              className="text-[#b98c70] text-[17px] hover:text-[#f9f9f9]"
            >
              Sign in!
            </Link>
          </p>
        </div>

        {step === "otp" && (
          <div className="w-76 grid gap-4">
            <input
              value={otp}
              onChange={(e) => setOTP(e.target.value)}
              placeholder="Nhập mã OTP"
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
                focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
                ${otp ? "bg-[#E8F0FE] text-black" : ""}
                transition-all duration-300`}
              required
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