"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../../app/store/features/userSlice";
import BookingProgressBar from "../../../components/common/BookingProgressBar";
import Loading from "@/components/common/Loading";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector(selectUser);

  const room_id = searchParams.get("room_id");
  const room_name = searchParams.get("room_name");
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");
  const price_per_night = Number(searchParams.get("price_per_night") || 0);
  const adults = Number(searchParams.get("adults") || 1);
  const full_name = searchParams.get("full_name");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const is_main_guest = searchParams.get("is_main_guest") === "1";
  const is_for_other = searchParams.get("is_for_other") === "1";
  const special_requests = searchParams.get("special_requests") || "";

  const [roomDetail, setRoomDetail] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [nights, setNights] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingRoom, setLoadingRoom] = useState(true);

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Lấy thông tin phòng
  useEffect(() => {
    const fetchRoomDetail = async () => {
      if (!room_id) return;
      try {
        const res = await fetch(`/api/room/${room_id}`);
        if (!res.ok) {
          toast.error("Không thể tải thông tin phòng");
          router.push("/");
          return;
        }
        const data = await res.json();
        setRoomDetail(data);
      } catch (error) {
        console.error("Error fetching room:", error);
        toast.error("Lỗi khi tải thông tin phòng");
        router.push("/");
      } finally {
        setLoadingRoom(false);
      }
    };
    fetchRoomDetail();
  }, [room_id, router]);

  useEffect(() => {
    if (room_id && check_in && check_out && price_per_night) {
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      const diffTime = checkOutDate - checkInDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
      setTotalPrice(diffDays * price_per_night);
    }
  }, [room_id, check_in, check_out, price_per_night]);

  // Kiểm tra nếu thiếu thông tin
  useEffect(() => {
    if (!room_id || !check_in || !check_out || !full_name || !email || !phone) {
      toast.warning("Thiếu thông tin đặt phòng");
      router.push("/");
    }
  }, [room_id, check_in, check_out, full_name, email, phone, router]);

  const handleConfirmBooking = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để đặt phòng.");
      router.push("/login");
      return;
    }

    if (!full_name || !email || !phone) {
      toast.warning("Thiếu thông tin đặt phòng. Vui lòng quay lại.");
      router.push("/");
      return;
    }

    // KHÔNG tạo booking vào database ở đây
    // Chỉ redirect đến trang thanh toán với tất cả thông tin
    // Booking sẽ được tạo khi thanh toán thành công
    const params = new URLSearchParams({
      room_id: room_id,
      room_name: room_name || "",
      check_in: check_in,
      check_out: check_out,
      total_price: totalPrice.toString(),
      nights: nights.toString(),
      adults: adults.toString(),
      full_name: full_name,
      email: email,
      phone: phone,
      is_main_guest: is_main_guest ? "1" : "0",
      is_for_other: is_for_other ? "1" : "0",
      special_requests: special_requests || "",
    });
    router.push(`/payment?${params.toString()}`);
  };

  if (loadingRoom || !roomDetail) {
    return (
      <Loading 
        message="Đang tải thông tin thanh toán..." 
        fullScreen={true}
        color="amber"
        className="bg-[#f9f9f9]"
      />
    );
  }

  if (!room_id || !check_in || !check_out || !full_name || !email || !phone) {
    return null;
  }

  return (
    <div className="h-screen bg-[#f9f9f9] overflow-y-auto pt-16 sm:pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto py-3 sm:py-4 md:py-6 lg:py-8 px-3 sm:px-4 md:px-6 pb-6 sm:pb-8">
        <BookingProgressBar currentStep={3} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6 md:mb-8">
          {/* Bên trái: Thông tin phòng */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-[#5a4330] mb-4">
                Thông tin phòng đã chọn
              </h2>
              
              {/* Hình ảnh phòng */}
              {roomDetail.photos && roomDetail.photos.length > 0 && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img
                    src={roomDetail.photos[0]}
                    alt={room_name || "Phòng"}
                    className="w-full h-[300px] object-cover"
                  />
                </div>
              )}

              {/* Thông tin phòng */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#5a4330] mb-2">
                    {room_name || roomDetail.name}
                  </h3>
                  {roomDetail.description && (
                    <p className="text-gray-600 text-base">{roomDetail.description}</p>
                  )}
                </div>

                <div className="border-t border-b py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Nhận phòng:</span>
                    <span className="font-medium text-lg">{formatDate(check_in)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Trả phòng:</span>
                    <span className="font-medium text-lg">{formatDate(check_out)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Số đêm:</span>
                    <span className="font-medium text-lg">{nights} đêm</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Số người:</span>
                    <span className="font-medium text-lg">{adults} người</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-lg">Giá phòng/đêm:</span>
                    <span className="font-semibold text-lg">
                      {price_per_night.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-2xl font-bold text-amber-700 pt-2 border-t">
                    <span>Tổng tiền:</span>
                    <span>{totalPrice.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bên phải: Thông tin khách hàng và xác nhận */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-6">
              Thông tin đặt phòng
            </h2>

            <div className="space-y-6">
              {/* Thông tin khách hàng */}
              <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                <h3 className="text-xl font-semibold text-[#5a4330] mb-4">
                  Thông tin liên hệ
                </h3>
                <div>
                  <span className="text-gray-600 text-base block mb-1">Họ và tên:</span>
                  <span className="font-semibold text-lg text-[#5a4330]">{full_name}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-base block mb-1">Email:</span>
                  <span className="font-semibold text-lg text-[#5a4330]">{email}</span>
                </div>
                <div>
                  <span className="text-gray-600 text-base block mb-1">Số điện thoại:</span>
                  <span className="font-semibold text-lg text-[#5a4330]">{phone}</span>
                </div>
              </div>

              {/* Thông tin đặt phòng cho ai */}
              <div className="bg-amber-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-[#5a4330] mb-4">
                  Bạn đặt phòng cho ai?
                </h3>
                <div className="space-y-2">
                  {is_main_guest && (
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-600 mr-2"></i>
                      <span className="text-lg text-gray-700">Tôi là khách lưu trú chính</span>
                    </div>
                  )}
                  {is_for_other && (
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-600 mr-2"></i>
                      <span className="text-lg text-gray-700">Đặt phòng này là cho người khác</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Các Yêu Cầu Đặc Biệt */}
              {special_requests && (
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <h3 className="text-xl font-semibold text-[#5a4330] mb-3 flex items-center">
                    <i className="fas fa-star text-amber-600 mr-2"></i>
                    Các Yêu Cầu Đặc Biệt:
                  </h3>
                  <p className="text-gray-700 text-base whitespace-pre-wrap leading-relaxed">
                    {special_requests}
                  </p>
                </div>
              )}


              {/* Thông tin giá tổng */}
              <div className="border-t border-b py-6 space-y-3">
                <div className="flex justify-between text-xl">
                  <span className="text-gray-700">Giá phòng/đêm:</span>
                  <span className="font-semibold">
                    {price_per_night.toLocaleString("vi-VN")} VNĐ
                  </span>
                </div>
                <div className="flex justify-between text-xl">
                  <span className="text-gray-700">Số đêm:</span>
                  <span className="font-semibold">{nights} đêm</span>
                </div>
                <div className="flex justify-between text-3xl font-bold text-amber-700 pt-4 border-t">
                  <span>Tổng tiền:</span>
                  <span>{totalPrice.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-semibold text-lg mb-2">
                        Không thể đặt phòng
                      </h4>
                      <p className="text-red-700 text-base leading-relaxed">{error}</p>
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-red-600 text-sm">
                          <i className="fas fa-lightbulb mr-2"></i>
                          <strong>Gợi ý:</strong> Vui lòng quay lại và chọn khoảng thời gian khác hoặc chọn phòng khác.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-semibold py-3 text-lg rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 text-lg rounded-xl shadow-md"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
