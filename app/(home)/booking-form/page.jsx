"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../../app/store/features/userSlice";
import BookingProgressBar from "../../../components/common/BookingProgressBar";
import Loading from "@/components/common/Loading";
import Map from "@/components/common/Map";

const BookingFormPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useSelector(selectUser);

  const room_id = searchParams.get("room_id");
  const room_name = searchParams.get("room_name");
  const check_in = searchParams.get("check_in");
  const check_out = searchParams.get("check_out");
  const price_per_night = Number(searchParams.get("price_per_night") || 0);
  const [adults, setAdults] = useState(Number(searchParams.get("adults") || 1));

  const [roomDetail, setRoomDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    isMainGuest: true,
    isForOther: false,
    specialRequests: "",
  });
  const [formErrors, setFormErrors] = useState({});

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

  // Tính số đêm và tổng tiền
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (check_in && check_out && price_per_night) {
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      const diffTime = checkOutDate - checkInDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setNights(diffDays);
      setTotalPrice(diffDays * price_per_night);
    }
  }, [check_in, check_out, price_per_night]);

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
        setLoading(false);
      }
    };
    fetchRoomDetail();
  }, [room_id, router]);

  // Điền thông tin user nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Kiểm tra nếu thiếu thông tin
  useEffect(() => {
    if (!room_id || !check_in || !check_out) {
      toast.warning("Thiếu thông tin đặt phòng");
      router.push("/");
    }
  }, [room_id, check_in, check_out, router]);

  // Validation form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = "Vui lòng nhập họ và tên";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ""))) {
      errors.phone = "Số điện thoại không hợp lệ";
    }

    if (!formData.isMainGuest && !formData.isForOther) {
      errors.bookingFor = "Vui lòng chọn bạn đặt phòng cho ai";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleCheckboxChange = (name) => {
    setFormData((prev) => {
      if (name === "isMainGuest") {
        return {
          ...prev,
          isMainGuest: true,
          isForOther: false,
        };
      } else {
        return {
          ...prev,
          isMainGuest: false,
          isForOther: true,
        };
      }
    });
    
    // Xóa lỗi
    if (formErrors.bookingFor) {
      setFormErrors((prev) => ({
        ...prev,
        bookingFor: undefined,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Chuyển đến trang xác nhận với tất cả thông tin
    const params = new URLSearchParams({
      room_id: room_id,
      room_name: room_name || "",
      check_in: check_in || "",
      check_out: check_out || "",
      price_per_night: price_per_night.toString(),
      adults: adults.toString(),
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      is_main_guest: formData.isMainGuest ? "1" : "0",
      is_for_other: formData.isForOther ? "1" : "0",
    });

    // Thêm special requests nếu có
    if (formData.specialRequests.trim()) {
      params.append("special_requests", formData.specialRequests.trim());
    }

    router.push(`/checkout?${params.toString()}`);
  };

  if (loading || !roomDetail) {
    return (
      <Loading 
        message="Đang tải thông tin đặt phòng..." 
        fullScreen={true}
        color="amber"
        className="bg-[#f9f9f9]"
      />
    );
  }

  if (!room_id || !check_in || !check_out) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-4 sm:py-6 md:py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <BookingProgressBar currentStep={2} />

        <div className="grid grid-cols-1 lg:grid-cols-[30%_70%] gap-4 sm:gap-6 lg:gap-8 mt-4 sm:mt-6">
          {/* Bên trái: Hình ảnh và thông tin phòng */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden order-2 lg:order-1">
            <div className="p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#5a4330] mb-4">
                Thông tin phòng đã chọn
              </h2>
              
              {/* Hình ảnh phòng */}
              {roomDetail.photos && roomDetail.photos.length > 0 && (
                <div className="mb-4 sm:mb-6 rounded-lg overflow-hidden">
                  <img
                    src={roomDetail.photos[0]}
                    alt={room_name || "Phòng"}
                    className="w-full h-[200px] sm:h-[250px] md:h-[300px] object-cover"
                  />
                </div>
              )}

              {/* Thông tin phòng */}
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#5a4330] mb-2">
                    {room_name || roomDetail.name}
                  </h3>
                  {roomDetail.description && (
                    <p className="text-gray-600 text-sm sm:text-base">{roomDetail.description}</p>
                  )}
                </div>

                <div className="border-t border-b py-3 sm:py-4 space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-gray-600 text-sm sm:text-base md:text-lg">Nhận phòng:</span>
                    <span className="font-medium text-sm sm:text-base md:text-lg text-right">{formatDate(check_in)}</span>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-gray-600 text-sm sm:text-base md:text-lg">Trả phòng:</span>
                    <span className="font-medium text-sm sm:text-base md:text-lg text-right">{formatDate(check_out)}</span>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-gray-600 text-sm sm:text-base md:text-lg">Số đêm:</span>
                    <span className="font-medium text-sm sm:text-base md:text-lg">{nights} đêm</span>
                  </div>
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-gray-600 text-sm sm:text-base md:text-lg">Số người:</span>
                    <span className="font-medium text-sm sm:text-base md:text-lg">{adults} người</span>
                  </div>
                </div>

                <div className="pt-3 sm:pt-4 border-t">
                  <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <span className="text-gray-600 text-sm sm:text-base md:text-lg">Giá phòng/đêm:</span>
                    <span className="font-semibold text-sm sm:text-base md:text-lg text-right">
                      {price_per_night.toLocaleString("vi-VN")} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg sm:text-xl md:text-2xl font-bold text-amber-700 pt-2 border-t flex-wrap gap-2">
                    <span>Tổng tiền:</span>
                    <span className="text-right">{totalPrice.toLocaleString("vi-VN")} VNĐ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bên phải: Form nhập thông tin */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 order-1 lg:order-2">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#5a4330] mb-4 sm:mb-6">
              Thông tin đặt phòng
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Họ và tên */}
              <div>
                <label className="block mb-2 text-[#5a4330] font-medium text-base sm:text-lg">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2.5 sm:p-3 text-base sm:text-lg focus:outline-none focus:ring-2 ${
                    formErrors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-amber-700"
                  }`}
                  placeholder="Nhập họ và tên"
                />
                {formErrors.fullName && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-[#5a4330] font-medium text-base sm:text-lg">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2.5 sm:p-3 text-base sm:text-lg focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-amber-700"
                  }`}
                  placeholder="Nhập email"
                />
                {formErrors.email && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Số điện thoại */}
              <div>
                <label className="block mb-2 text-[#5a4330] font-medium text-base sm:text-lg">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg p-2.5 sm:p-3 text-base sm:text-lg focus:outline-none focus:ring-2 ${
                    formErrors.phone
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-amber-700"
                  }`}
                  placeholder="Nhập số điện thoại"
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.phone}</p>
                )}
              </div>

              {/* Bạn đặt phòng cho ai? */}
              <div>
                <label className="block mb-2 sm:mb-3 text-[#5a4330] font-medium text-base sm:text-lg">
                  Bạn đặt phòng cho ai? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 sm:space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isMainGuest}
                      onChange={() => handleCheckboxChange("isMainGuest")}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 border-gray-300 rounded focus:ring-amber-700 focus:ring-2 flex-shrink-0"
                    />
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base md:text-lg text-gray-700">
                      Tôi là khách lưu trú chính
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isForOther}
                      onChange={() => handleCheckboxChange("isForOther")}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 border-gray-300 rounded focus:ring-amber-700 focus:ring-2 flex-shrink-0"
                    />
                    <span className="ml-2 sm:ml-3 text-sm sm:text-base md:text-lg text-gray-700">
                      Đặt phòng này là cho người khác
                    </span>
                  </label>
                </div>
                {formErrors.bookingFor && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2">{formErrors.bookingFor}</p>
                )}
              </div>

              {/* Các Yêu Cầu Đặc Biệt */}
              <div>
                <label className="block mb-2 text-[#5a4330] font-medium text-base sm:text-lg">
                  Các Yêu Cầu Đặc Biệt:
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                  placeholder="Nhập các yêu cầu đặc biệt của bạn (ví dụ: giường đôi, phòng tầng cao, không hút thuốc, v.v.)"
                />
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  Thông tin này sẽ được gửi đến khách sạn để đáp ứng tốt nhất nhu cầu của bạn
                </p>
              </div>

              {/* Nút Submit */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:flex-1 bg-gray-200 hover:bg-gray-300 transition-colors text-gray-800 font-semibold py-2.5 sm:py-3 text-base sm:text-lg rounded-lg sm:rounded-xl"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 bg-amber-700 hover:bg-amber-800 transition-colors text-white font-semibold py-2.5 sm:py-3 text-base sm:text-lg rounded-lg sm:rounded-xl shadow-md"
                >
                  Tiếp tục
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bản đồ */}
        {roomDetail?.map_url && (
          <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#5a4330] mb-4 sm:mb-6">
              Vị trí khách sạn
            </h2>
            <Map mapUrl={roomDetail.map_url} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingFormPage;

