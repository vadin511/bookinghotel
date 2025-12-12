"use client";

import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import { fetchRoomById } from "../../../store/features/roomSlice";
import { fetchUserProfile, selectUser } from "../../../store/features/userSlice";

import Loading from "@/components/common/Loading";
import BookingCalendar from "@/components/common/BookingCalendar";

const RoomDetailPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { roomDetail, loading, error } = useSelector((state) => state.rooms);
  const user = useSelector(selectUser);

  // ---------------- STATE ----------------
  const [checkIn, setCheckIn] = useState(searchParams.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(searchParams.get("check_out") || "");
  const [adults, setAdults] = useState(Number(searchParams.get("adults")) || 1);
  const [roomTypes, setRoomTypes] = useState([]);

  const [dateError, setDateError] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const checkInRef = useRef();
  const checkOutRef = useRef();
  const calendarButtonRef = useRef();
  const calendarRef = useRef();

  // ----------------------------------------
  // Lấy dữ liệu phòng + user profile + room types
  // ----------------------------------------
  useEffect(() => {
    if (id) dispatch(fetchRoomById(id));
    dispatch(fetchUserProfile());
    
    // Fetch room types
    const fetchRoomTypes = async () => {
      try {
        const res = await fetch("/api/room-types");
        if (res.ok) {
          const data = await res.json();
          setRoomTypes(data);
        }
      } catch (err) {
        console.error("Error fetching room types:", err);
      }
    };
    fetchRoomTypes();
  }, [dispatch, id]);


  // ----------------------------------------
  // Đồng bộ data từ URL khi quay lại từ login
  // ----------------------------------------
  useEffect(() => {
    setCheckIn(searchParams.get("check_in") || "");
    setCheckOut(searchParams.get("check_out") || "");
    setAdults(Math.max(1, Number(searchParams.get("adults")) || 1));
  }, [searchParams]);

  // ----------------------------------------
  // Kiểm tra số người vượt max_people
  // ----------------------------------------
  useEffect(() => {
    if (roomDetail?.max_people && adults > roomDetail.max_people) {
      setAdults(roomDetail.max_people);
      toast.warning(
        `Phòng này tối đa ${roomDetail.max_people} người. Đã tự điều chỉnh.`
      );
    }
  }, [roomDetail?.max_people]);

  // ----------------------------------------
  // Check Availability API
  // ----------------------------------------
  const checkRoomAvailability = useCallback(async () => {
    if (!checkIn || !checkOut || !id) return;

    setCheckingAvailability(true);
    try {
      const res = await fetch(
        `/api/rooms/${id}/availability?check_in=${checkIn}&check_out=${checkOut}`
      );
      const data = await res.json();

      setIsAvailable(data.available);
      setAvailabilityMessage(data.message || "");
    } catch {
      setIsAvailable(false);
      setAvailabilityMessage("Không thể kiểm tra trạng thái phòng");
    } finally {
      setCheckingAvailability(false);
    }
  }, [checkIn, checkOut, id]);

  // ----------------------------------------
  // Validate ngày và check availability
  // ----------------------------------------
  useEffect(() => {
    if (!checkIn || !checkOut) {
      setDateError("");
      setIsAvailable(true);
      setAvailabilityMessage("");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (inDate < today) {
      setDateError("Ngày check-in không được là quá khứ");
      setIsAvailable(false);
      return;
    }
    if (outDate <= inDate) {
      setDateError("Ngày check-out phải sau ngày check-in");
      setIsAvailable(false);
      return;
    }

    setDateError("");
    checkRoomAvailability();
  }, [checkIn, checkOut, checkRoomAvailability]);

  // ----------------------------------------
  // Debug: Log photos để kiểm tra
  // ----------------------------------------
  useEffect(() => {
    if (roomDetail?.photos) {
      console.log('Room photos:', roomDetail.photos);
      console.log('First photo URL:', roomDetail.photos[0]);
    }
  }, [roomDetail?.photos]);

  // ----------------------------------------
  // Close calendar when clicking outside
  // ----------------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCalendar &&
        calendarRef.current &&
        calendarButtonRef.current &&
        !calendarRef.current.contains(event.target) &&
        !calendarButtonRef.current.contains(event.target)
      ) {
        setShowCalendar(false);
      }
    };

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  // ----------------------------------------
  // Xử lý đặt phòng
  // ----------------------------------------
  const handleBookRoom = () => {
    if (!user) {
      const params = new URLSearchParams();
      if (checkIn) params.append("check_in", checkIn);
      if (checkOut) params.append("check_out", checkOut);
      if (adults) params.append("adults", adults);

      router.push(`/login?redirect=${encodeURIComponent(`/rooms/${id}?${params}`)}`);
      return;
    }

    // Nếu chưa chọn ngày, tự động mở date picker
    if (!checkIn) {
      checkInRef.current?.showPicker();
      return;
    }
    if (!checkOut) {
      checkOutRef.current?.showPicker();
      return;
    }

    if (dateError) return toast.error(dateError);
    if (!isAvailable) return toast.error("Phòng không khả dụng.");

    if (adults < 1) return toast.warning("Vui lòng chọn số người.");
    if (roomDetail?.max_people && adults > roomDetail.max_people)
      return toast.error("Số người vượt quá giới hạn.");

    router.push(
      `/booking-form?room_id=${roomDetail.id}&room_name=${encodeURIComponent(
        roomDetail.name
      )}&check_in=${checkIn}&check_out=${checkOut}&price_per_night=${roomDetail.price_per_night
      }&adults=${adults}`
    );
  };

  // ----------------------------------------
  // Helper: Lấy tên loại phòng từ room_type_id
  // ----------------------------------------
  const getRoomTypeName = (roomTypeId) => {
    if (!roomTypeId) return null;
    
    // Tìm trong danh sách room types
    const roomType = roomTypes.find(
      (type) => 
        type.id === roomTypeId || 
        type.id === parseInt(roomTypeId) || 
        type.name?.toLowerCase() === String(roomTypeId).toLowerCase()
    );
    
    return roomType?.name || roomTypeId;
  };

  // ----------------------------------------
  // UI Rendering
  // ----------------------------------------
  if (loading)
    return (
      <Loading
        message="Đang tải thông tin phòng..."
        fullScreen
        color="amber"
        className="bg-[#eeebe9]"
      />
    );

  if (error) return <p>Lỗi: {error}</p>;
  if (!roomDetail) return <p>Không tìm thấy phòng</p>;

  return (
    <div className="bg-[#eeebe9] min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* MAIN CONTENT: IMAGE SLIDER LEFT + ROOM INFO RIGHT */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="flex flex-col lg:flex-row">
            {/* LEFT: IMAGE SLIDER */}
            <div className="lg:w-1/2 relative">
              {roomDetail.photos && Array.isArray(roomDetail.photos) && roomDetail.photos.length > 0 ? (
                <>
                  <div 
                    className="relative h-[400px] lg:h-[500px] cursor-pointer bg-gray-100 overflow-hidden group"
                    onClick={() => {
                      setGalleryIndex(0);
                      setShowGallery(true);
                    }}
                  >
                    {roomDetail.photos[0] && roomDetail.photos[0].trim() ? (
                      <>
                        <img 
                          src={roomDetail.photos[0]} 
                          alt={roomDetail.name || "Room image"} 
                          className="w-full h-full object-cover"
                          style={{ display: 'block' }}
                          onError={(e) => {
                            console.error('Error loading image:', roomDetail.photos[0]);
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            if (parent && !parent.querySelector('.error-fallback')) {
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'error-fallback absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400';
                              errorDiv.textContent = 'Lỗi tải ảnh';
                              parent.appendChild(errorDiv);
                            }
                          }}
                          onLoad={(e) => {
                            // Ảnh tải thành công
                            e.target.style.opacity = '1';
                            console.log('Image loaded successfully:', roomDetail.photos[0]);
                          }}
                        />
                        <div className="absolute inset-0 bg-transparent group-hover:bg-black/10 transition-all duration-200 flex items-center justify-center pointer-events-none z-10">
                          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium bg-black/50 px-4 py-2 rounded">
                            Click để xem tất cả ảnh ({roomDetail.photos.length})
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 bg-gray-200">
                        <div className="text-center">
                          <p className="mb-2">Chưa có ảnh</p>
                          <p className="text-xs text-gray-500">URL: {roomDetail.photos[0] || 'null'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {roomDetail.photos.length > 1 && (
                    <div className="p-2 bg-gray-50">
                      <Swiper
                        modules={[Navigation]}
                        navigation
                        spaceBetween={8}
                        slidesPerView={4}
                        className="h-20"
                      >
                        {roomDetail.photos.slice(1, 5).map((src, idx) => (
                          <SwiperSlide key={idx + 1}>
                            <div 
                              className="relative h-full cursor-pointer rounded overflow-hidden bg-gray-200"
                              onClick={() => {
                                setGalleryIndex(idx + 1);
                                setShowGallery(true);
                              }}
                            >
                              {src ? (
                                <img 
                                  src={src} 
                                  alt={`${roomDetail.name} - Ảnh ${idx + 2}`} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : null}
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-[400px] lg:h-[500px] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* RIGHT: ROOM INFO */}
            <div className="lg:w-1/2 p-6 lg:p-8 text-[#5a4330]">
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{roomDetail.name}</h1>
              
              {roomDetail.price_per_night && (
                <div className="mb-6">
                  <span className="text-2xl lg:text-3xl font-semibold text-amber-700">
                    {roomDetail.price_per_night.toLocaleString('vi-VN')} VNĐ
                  </span>
                  <span className="text-gray-600 ml-2">/ đêm</span>
                </div>
              )}

              {/* Thông tin khách sạn */}
              {(roomDetail.hotel_name || roomDetail.hotel_address) && (
                <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <i className="fas fa-hotel text-amber-700 mt-1"></i>
                    <div>
                      {roomDetail.hotel_name && (
                        <p className="font-semibold text-amber-900">{roomDetail.hotel_name}</p>
                      )}
                      {roomDetail.hotel_address && (
                        <p className="text-sm text-amber-800">{roomDetail.hotel_address}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {roomDetail.description && (
                <p className="text-base lg:text-lg mb-6 leading-relaxed text-gray-700">
                  {roomDetail.description}
                </p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Loại phòng */}
                {roomDetail.room_type_id && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-star text-amber-600 w-5"></i>
                    <span className="font-semibold">Loại phòng:</span>
                    <span>{getRoomTypeName(roomDetail.room_type_id)}</span>
                  </div>
                )}
                
                {roomDetail.max_people && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-users text-amber-600 w-5"></i>
                    <span className="font-semibold">Sức chứa:</span>
                    <span>{roomDetail.max_people} người</span>
                  </div>
                )}
                
                {(roomDetail.area_sqm || roomDetail.area) && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-ruler-combined text-amber-600 w-5"></i>
                    <span className="font-semibold">Diện tích:</span>
                    <span>{roomDetail.area_sqm || roomDetail.area} m²</span>
                  </div>
                )}
                
                {roomDetail.bed_type && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-bed text-amber-600 w-5"></i>
                    <span className="font-semibold">Loại giường:</span>
                    <span>{roomDetail.bed_type}</span>
                  </div>
                )}

                {/* Trạng thái phòng */}
                {roomDetail.status && (
                  <div className="flex items-center gap-2">
                    <i className="fas fa-info-circle text-amber-600 w-5"></i>
                    <span className="font-semibold">Trạng thái:</span>
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      roomDetail.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {roomDetail.status === 'available' ? 'Có sẵn' : 
                       roomDetail.status === 'maintenance' ? 'Bảo trì' : roomDetail.status}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-xl font-semibold mb-3">Tiện ích phòng</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside text-sm lg:text-base text-gray-700">
                  <li>Điều hòa</li>
                  <li>Wi-Fi miễn phí</li>
                  <li>Tủ lạnh</li>
                  <li>TV</li>
                  <li>Phòng tắm riêng</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* BOOKING FORM - COMPACT */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold text-[#5a4330] mb-4">Đặt phòng</h2>
          
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-end">
            {/* DATE SELECTOR WITH CALENDAR */}
            <div className="flex-1 relative" ref={calendarButtonRef}>
              <label className="block mb-1 text-sm font-medium text-[#5a4330]">Chọn ngày</label>
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <i className="far fa-calendar-alt text-gray-400"></i>
                  {checkIn && checkOut ? (
                    <span className="text-gray-700">
                      {(() => {
                        const [y1, m1, d1] = checkIn.split('-').map(Number);
                        const [y2, m2, d2] = checkOut.split('-').map(Number);
                        const date1 = new Date(y1, m1 - 1, d1);
                        const date2 = new Date(y2, m2 - 1, d2);
                        return date1.toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "short"
                        }) + " — " + date2.toLocaleDateString("vi-VN", {
                          day: "numeric",
                          month: "short"
                        });
                      })()}
                    </span>
                  ) : (
                    <span className="text-gray-500">Chọn ngày nhận phòng và trả phòng</span>
                  )}
                </div>
                <i className={`fas fa-chevron-${showCalendar ? 'up' : 'down'} text-gray-400 text-xs`}></i>
              </button>
              
              {showCalendar && (
                <div ref={calendarRef}>
                  <BookingCalendar
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={(date) => {
                      setCheckIn(date);
                      if (checkOut && date >= checkOut) {
                        setCheckOut("");
                      }
                    }}
                    onCheckOutChange={(date) => {
                      setCheckOut(date);
                    }}
                    roomId={id}
                    pricePerNight={roomDetail?.price_per_night}
                    onClose={() => setShowCalendar(false)}
                  />
                </div>
              )}
            </div>

            {/* ADULTS - COMPACT */}
            <div className="flex-1 md:max-w-[200px]">
              <label className="block mb-1 text-sm font-medium text-[#5a4330]">Số người</label>
              <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <button
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  disabled={adults <= 1}
                  className={`w-7 h-7 rounded ${adults <= 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  –
                </button>
                <span className="flex-1 text-center text-sm font-medium">{adults}</span>
                <button
                  onClick={() => {
                    if (roomDetail.max_people && adults >= roomDetail.max_people) {
                      toast.warning(`Phòng tối đa ${roomDetail.max_people} người.`);
                      return;
                    }
                    setAdults(adults + 1);
                  }}
                  disabled={roomDetail.max_people ? adults >= roomDetail.max_people : false}
                  className={`w-7 h-7 rounded ${roomDetail.max_people && adults >= roomDetail.max_people ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                >
                  +
                </button>
              </div>
            </div>

            {/* BOOK BUTTON - COMPACT */}
            <button
              onClick={handleBookRoom}
              disabled={
                !checkIn ||
                !checkOut ||
                dateError ||
                !isAvailable ||
                (roomDetail.max_people && adults > roomDetail.max_people)
              }
              className={`w-full md:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition whitespace-nowrap ${
                !isAvailable || dateError
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-amber-700 hover:bg-amber-800"
              }`}
            >
              {!isAvailable ? "Đã đặt" : "Đặt phòng"}
            </button>
          </div>

          {/* ERRORS */}
          <div className="mt-3 space-y-1">
            {dateError && <p className="text-red-600 text-sm">{dateError}</p>}
            {checkingAvailability && <p className="text-blue-600 text-sm">Đang kiểm tra...</p>}
            {!checkingAvailability && availabilityMessage && (
              <p className={`text-sm ${isAvailable ? "text-green-600" : "text-red-600"}`}>
                {availabilityMessage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* GALLERY MODAL */}
      {showGallery && roomDetail.photos && Array.isArray(roomDetail.photos) && roomDetail.photos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowGallery(false)}
        >
          <div 
            className="relative w-full max-w-6xl h-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-10 h-10 flex items-center justify-center text-xl"
            >
              ×
            </button>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ clickable: true }}
              initialSlide={galleryIndex}
              className="h-full"
            >
              {roomDetail.photos.map((src, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    {src ? (
                      <img 
                        src={src} 
                        alt={`${roomDetail.name || "Room"} - Ảnh ${idx + 1}`} 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (parent && !parent.querySelector('.error-fallback')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-fallback flex items-center justify-center h-full text-white';
                            errorDiv.textContent = 'Lỗi tải ảnh';
                            parent.appendChild(errorDiv);
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-white">
                        Lỗi tải ảnh
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
