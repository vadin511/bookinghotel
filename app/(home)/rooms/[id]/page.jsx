"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import imgDetailRoom from "../../../../public/assets/images/detailRoom.png";
import { fetchRoomById } from "../../../store/features/roomSlice";
import {
  fetchUserProfile,
  selectUser,
} from "../../../store/features/userSlice";

const RoomDetailPage = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { roomDetail, loading, error } = useSelector((state) => state.rooms);
  const user = useSelector(selectUser);

  const router = useRouter();

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchRoomById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi: {error}</p>;
  if (!roomDetail) return <p>Không tìm thấy phòng</p>;

  const handleBookRoom = () => {
    if (!user) {
      alert("Vui lòng đăng nhập để đặt phòng.");
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Vui lòng chọn ngày Check-in và Check-out.");
      return;
    }

   router.push(
  `/checkout?room_id=${roomDetail.id}&room_name=${roomDetail.name}&check_in=${checkIn}&check_out=${checkOut}&price_per_night=${roomDetail.price_per_night}`
);

  };

  return (
    <div className="bg-[#eeebe9]">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-[#eeebe9] rounded-xl p-6 md:p-10">
          <p className="text-center text-[#5a4330] text-lg md:text-xl leading-relaxed mb-10">
            We may not have concierges at BYPILLOW, but we know exactly what
            your priorities are.
          </p>
          <div className="flex flex-col md:flex-row md:space-x-10">
            <div className="flex justify-center md:justify-center md:flex-1 mb-10 md:mb-0">
              <Image
                src={imgDetailRoom}
                alt=""
                className="max-w-full h-auto"
                height="400"
                width="400"
              />
            </div>
            <div className="md:flex-1 text-[#5a4330] text-base md:text-lg leading-relaxed">
              <h2 className="text-xl md:text-2xl font-normal mb-4">
                The {roomDetail.name} General Services
              </h2>
              <ul className="list-disc list-inside space-y-1 mb-10">
                <li>Air conditioning in common areas</li>
                <li>Free luggage storage</li>
                <li>Lift</li>
                <li>Late check out option (on request): 10 € per room</li>
                <li>Reception from 14:00 to 22:00</li>
                <li>Free Wi-Fi connection throughout the hotel</li>
                <li>Multilingual reception staff</li>
                <li>
                  Airport shuttle service on request (for a fee) with Welcome
                  Pickups company.
                </li>
                <li>Tourist services (booking of tickets, excursions...)</li>
                <li>Check in: 14:00/ Check out: 11:00</li>
              </ul>
              <h3 className="text-xl md:text-2xl font-normal mb-4">
                General Conditions
              </h3>
              <ul className="list-disc list-inside space-y-1 mb-6">
                <li>
                  Guarantee deposit: a deposit of 100 euros will be requested
                  for possible damages. It will be charged on arrival, and once
                  everything is checked that everything is correct, it will be
                  returned to the same credit card.
                </li>
              </ul>
            </div>
          </div>
          {/* Inputs chọn ngày */}
          <div className="mb-4 space-y-2">
            <div>
              <label className="block mb-1">Check-in:</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
            <div>
              <label className="block mb-1">Check-out:</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>

          <button
            onClick={handleBookRoom}
            className="bg-amber-700 p-4 text-white w-full mt-4"
          >
            Book
          </button>
        </div>
      </div>
      <div className="w-full max-w-7xl mx-auto py-6">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop
          className="rounded-2xl overflow-hidden"
        >
          {roomDetail.photos?.map((src, idx) => (
            <SwiperSlide key={idx}>
              <img
                src={src}
                alt={`Slide ${idx + 1}`}
                className="w-full h-[500px] object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default RoomDetailPage;
