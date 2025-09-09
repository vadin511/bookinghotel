"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { createBooking } from "../../../app/store/features/bookingsSlide";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const room_id = searchParams.get("room_id");
  const room_name = searchParams.get("room_name");
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");
  const price_per_night = Number(searchParams.get("price_per_night") || 0);

  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (room_id && check_in && check_out && room_name) {
      const nights =
        (new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24);
      setTotalPrice(nights * price_per_night);
    }
  }, [room_id, check_in, check_out, price_per_night]);

  const handleConfirmBooking = () => {
    dispatch(
      createBooking({
        room_id: Number(room_id),
        check_in,
        check_out,
        total_price: totalPrice,
        status: "confirmed",
      })
    )
      .then(() => {
        alert("Đặt phòng thành công!");
        router.push("/"); // Có thể redirect về homepage hoặc bookings page
      })
      .catch((err) => {
        alert("Lỗi khi đặt phòng: " + err.message);
      });
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4 py-10">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-center text-[#5a4330]">
          Xác nhận đặt phòng
        </h1>
        <div className="border-t border-b py-6 space-y-3 text-[#333] text-lg">
          <div className="flex justify-between">
            <span>Room name</span>
            <span className="font-medium">{room_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-medium">{check_in}</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-medium">{check_out}</span>
          </div>
          <div className="flex justify-between">
            <span>Giá phòng/đêm:</span>
            <span className="font-medium">${price_per_night}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-amber-700 pt-4 border-t">
            <span>Tổng tiền:</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        <button
          onClick={handleConfirmBooking}
          className="w-full bg-amber-700 hover:bg-amber-800 transition-colors text-white text-lg font-semibold py-4 rounded-xl shadow-md"
        >
          Xác nhận đặt phòng
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
