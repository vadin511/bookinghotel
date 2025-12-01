"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../../app/store/features/userSlice";
import BookingProgressBar from "../../../components/common/BookingProgressBar";
import Loading from "@/components/common/Loading";

const PaymentPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector(selectUser);

  const room_id = searchParams.get("room_id");
  const room_name = searchParams.get("room_name");
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");
  const total_price = Number(searchParams.get("total_price") || 0);
  const nights = Number(searchParams.get("nights") || 0);
  const adults = Number(searchParams.get("adults") || 1);
  const full_name = searchParams.get("full_name");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const is_main_guest = searchParams.get("is_main_guest") === "1";
  const is_for_other = searchParams.get("is_for_other") === "1";
  const special_requests = searchParams.get("special_requests") || "";

  const [roomDetail, setRoomDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [countdown, setCountdown] = useState(10);

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

  // Kiểm tra nếu thiếu thông tin
  useEffect(() => {
    if (!room_id || !check_in || !check_out || !full_name || !email || !phone) {
      toast.warning("Thiếu thông tin đặt phòng");
      router.push("/");
    }
  }, [room_id, check_in, check_out, full_name, email, phone, router]);

  // Kiểm tra đăng nhập
  useEffect(() => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thanh toán.");
      router.push("/login");
    }
  }, [user, router]);

  // Countdown timer khi thanh toán thành công
  useEffect(() => {
    if (paymentSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && countdown === 0) {
      router.push(`/my-bookings${bookingId ? `?booking_id=${bookingId}` : ''}`);
    }
  }, [paymentSuccess, countdown, router, bookingId]);

  const handlePayment = async () => {
    if (!user) {
      toast.warning("Vui lòng đăng nhập để thanh toán.");
      router.push("/login");
      return;
    }

    if (!room_id || !check_in || !check_out || !total_price) {
      toast.error("Thiếu thông tin thanh toán. Vui lòng quay lại.");
      router.push("/");
      return;
    }

    // Validate payment method
    if (!paymentMethod) {
      toast.warning("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    setLoading(true);

    try {
      const paymentData = {
        room_id: room_id,
        check_in: check_in,
        check_out: check_out,
        total_price: total_price,
        payment_method: paymentMethod,
        payment_data: null,
      };

      const res = await fetch("/api/bookings/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Thanh toán thất bại");
        setLoading(false);
        return;
      }

      toast.success("Thanh toán thành công! Đặt phòng của bạn đã được xác nhận.");
      
      // Set payment success state
      setBookingId(data.booking_id);
      setPaymentSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Lỗi khi xử lý thanh toán. Vui lòng thử lại.");
      setLoading(false);
    }
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

  // Hiển thị trang thông báo thanh toán thành công
  if (paymentSuccess) {
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
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <BookingProgressBar currentStep={4} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bên trái: Thông tin đặt phòng */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-[#5a4330] mb-4">
                Thông tin đặt phòng
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
                    <p className="text-gray-600 text-base">
                      {roomDetail.description}
                    </p>
                  )}
                </div>

                <div className="border-t border-b py-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Nhận phòng:</span>
                    <span className="font-medium text-lg">
                      {formatDate(check_in)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">Trả phòng:</span>
                    <span className="font-medium text-lg">
                      {formatDate(check_out)}
                    </span>
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

                {/* Thông tin khách hàng */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-[#5a4330] mb-2">
                    Thông tin liên hệ
                  </h4>
                  <div>
                    <span className="text-gray-600 text-sm">Họ và tên:</span>
                    <span className="font-semibold text-base text-[#5a4330] block">
                      {full_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Email:</span>
                    <span className="font-semibold text-base text-[#5a4330] block">
                      {email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Số điện thoại:</span>
                    <span className="font-semibold text-base text-[#5a4330] block">
                      {phone}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-2xl font-bold text-amber-700 pt-2">
                    <span>Tổng tiền:</span>
                    <span>{total_price.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bên phải: Phương thức thanh toán */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-6">
              Phương thức thanh toán
            </h2>

            <div className="space-y-6">
              {/* Chọn phương thức thanh toán */}
              <div>
                <label className="block text-lg font-semibold text-[#5a4330] mb-4">
                  Chọn phương thức thanh toán
                </label>
                <div className="space-y-3">
                  {/* MoMo */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="momo"
                      checked={paymentMethod === "momo"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-amber-700"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[#5a4330]">
                        Thanh toán qua MoMo
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán nhanh chóng và tiện lợi
                      </div>
                    </div>
                    <img
                      src="/assets/images/LogoMoMo.webp"
                      alt="MoMo"
                      className="h-12 object-contain"
                    />
                  </label>

                  {/* VNPay */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="vnpay"
                      checked={paymentMethod === "vnpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-amber-700"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[#5a4330]">
                        Thanh toán qua VNPay
                      </div>
                      <div className="text-sm text-gray-600">
                        An toàn và bảo mật
                      </div>
                    </div>
                    <img
                      src="/assets/images/LogoVnpay.jpg"
                      alt="VNPay"
                      className="h-12 object-contain"
                    />
                  </label>

                  {/* Chuyển khoản ngân hàng */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={paymentMethod === "bank_transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-amber-700"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[#5a4330]">
                        Chuyển khoản ngân hàng
                      </div>
                      <div className="text-sm text-gray-600">
                        Vietcombank, BIDV, Techcombank
                      </div>
                    </div>
                    <i className="fas fa-university text-2xl text-gray-400"></i>
                  </label>

                  {/* COD */}
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 w-5 h-5 text-amber-700"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-[#5a4330]">
                        Thanh toán khi nhận phòng
                      </div>
                      <div className="text-sm text-gray-600">
                        Thanh toán trực tiếp tại khách sạn
                      </div>
                    </div>
                    <i className="fas fa-money-bill-wave text-2xl text-gray-400"></i>
                  </label>
                </div>
              </div>

              {/* Thông tin chuyển khoản */}
              {paymentMethod === "bank_transfer" && (
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-xl font-semibold text-[#5a4330] mb-4">
                    Thông tin chuyển khoản
                  </h3>
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <span className="text-gray-600">Ngân hàng:</span>
                        <span className="font-semibold text-lg ml-2">
                          Viettinbank
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Số tài khoản:</span>
                        <span className="font-semibold text-lg ml-2">
                          0989357834  
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Chủ tài khoản:</span>
                        <span className="font-semibold text-lg ml-2">
                         Trần Văn Dinh
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-semibold text-xl text-amber-700 ml-2">
                          {total_price.toLocaleString("vi-VN")} VNĐ
                        </span>
                      </div>
                      <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <i className="fas fa-info-circle mr-2"></i>
                          Vui lòng chuyển khoản đúng số tiền và ghi nội dung:{" "}
                          <strong>Dat phong {room_id}</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <img
                        src="/assets/images/QrCk.jpg"
                        alt="QR Code chuyển khoản"
                        className="w-32 h-32 object-contain rounded-lg bg-white p-2 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Thông tin COD */}
              {paymentMethod === "cod" && (
                <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
                  <h3 className="text-xl font-semibold text-[#5a4330] mb-4">
                    Thanh toán khi nhận phòng
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      Bạn sẽ thanh toán trực tiếp tại khách sạn khi check-in.
                    </p>
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <i className="fas fa-info-circle mr-2"></i>
                        Vui lòng mang đủ tiền mặt hoặc thẻ để thanh toán khi
                        nhận phòng.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="border-t border-b py-6">
                <div className="flex justify-between text-3xl font-bold text-amber-700">
                  <span>Tổng tiền:</span>
                  <span>{total_price.toLocaleString("vi-VN")} VNĐ</span>
                </div>
              </div>

              {/* Nút thanh toán */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-semibold py-3 text-lg rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 text-lg rounded-xl shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang xử lý...
                    </span>
                  ) : (
                    "Xác nhận thanh toán"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
