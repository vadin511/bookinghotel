"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = searchParams.get("booking_id");
  const orderId = searchParams.get("order_id");
  const transId = searchParams.get("trans_id");
  const [countdown, setCountdown] = useState(10);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      router.push(`/my-bookings${bookingId ? `?booking_id=${bookingId}` : ''}`);
    }
  }, [countdown, router, bookingId]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center py-10 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
        {/* Icon thành công */}
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <i className="fas fa-check-circle text-6xl text-green-600"></i>
          </div>
        </div>

        {/* Tiêu đề */}
        <h1 className="text-3xl md:text-4xl font-bold text-[#5a4330] mb-4">
          Thanh toán thành công!
        </h1>

        {/* Thông báo */}
        <p className="text-lg text-gray-600 mb-2">
          Đặt phòng của bạn đã được xác nhận thành công.
        </p>
        
        {/* Thông tin giao dịch */}
        {orderId && (
          <div className="mt-4 mb-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold">Mã đơn hàng:</span> {orderId}
            </p>
            {transId && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Mã giao dịch:</span> {transId}
              </p>
            )}
          </div>
        )}

        <p className="text-base text-gray-500 mb-8">
          Bạn sẽ được chuyển về trang đặt phòng của tôi sau{" "}
          <span className="text-2xl font-bold text-amber-700">{countdown}</span> giây
        </p>

        {/* Đếm ngược progress bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-amber-700 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((10 - countdown) / 10) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Nút điều hướng */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/my-bookings${bookingId ? `?booking_id=${bookingId}` : ''}`)}
            className="flex-1 bg-amber-700 hover:bg-amber-800 transition-colors text-white font-semibold py-3 px-6 text-lg rounded-xl shadow-md"
          >
            <i className="fas fa-calendar-check mr-2"></i>
            Quay về trang đặt phòng của tôi
          </button>
          <button
            onClick={() => router.push("/")}
            className="flex-1 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-semibold py-3 px-6 text-lg rounded-xl"
          >
            <i className="fas fa-home mr-2"></i>
            Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

