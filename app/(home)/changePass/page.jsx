"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectUser } from "../../../app/store/features/userSlice";
import bgLogin from "../../../public/assets/images/bgLogin.png";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const email = user?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/changePass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        throw new Error(data.message || "Đã có lỗi xảy ra");
      }

      setMessage(data.message);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const resultAction = dispatch(logoutUser());
    if (logoutUser.fulfilled.match(resultAction)) {
      window.location.href = "/login";
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

      {/* Change password form */}
      <div className="z-[2] bg-[rgb(6_5_7/25%)] backdrop-blur-[38px] shadow-[0_40px_30px_rgb(0_0_0_/_10%)] rounded-[40px] h-[550px] w-[380px] flex flex-col gap-5 items-center justify-center text-center px-6">
        <div>
          <p className="text-3xl font-bold">
            <span className="text-[#2c1c0d]">Reset</span> Password
          </p>
          <p>Let's help you update your password</p>
        </div>

        <form className="grid gap-4 w-full" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none disabled:block`}
            />
          </div>

          {/* New Password Field */}
          <div className="relative">
            <input
              type="password"
              placeholder="New Password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full h-14 !pl-5 rounded-lg bg-[#6f5b47] text-[#f9f8fa] outline-none
          focus:bg-[#E8F0FE] focus:text-black hover:shadow-[0_0_0_2px_#2c1c0d]
          ${newPassword ? "bg-[#E8F0FE] text-black" : ""}
          transition-all duration-300`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-14 px-4 rounded-lg bg-[#2c1c0d] text-[#f9f9f9] text-lg cursor-pointer relative overflow-hidden hover:bg-[#251f16] transition-colors duration-300"
          >
            {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
          </button>

          {message && (
            <p className="text-center text-sm text-white mt-2">{message}</p>
          )}
        </form>

        <Link
          href="/login"
          className="text-[#b1aca9] text-[17px] hover:text-[#f9f9f9]"
        >
          <button onClick={handleLogout}> Quay lại đăng nhập</button>
        </Link>
      </div>
    </div>
  );
}
