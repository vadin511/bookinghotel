"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { fetchHotels } from "../../../store/features/hotelSlice";
import { fetchRoomsByHotelId } from "../../../store/features/roomSlice";

export default function HotelDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const dispatch = useDispatch();
  const { hotelRooms, loading, error } = useSelector((state) => state.rooms);
  const { data: hotels } = useSelector((state) => state.hotels);
  const hotel = hotels.find((h) => String(h.id) === id);

  console.log(" Rooms data:", hotelRooms);

  console.log("Hotel data:", hotel);

  useEffect(() => {
    if (!hotels || hotels.length === 0) {
      dispatch(fetchHotels());
    }
  }, [dispatch, hotels]);

  useEffect(() => {
    if (id) {
      dispatch(fetchRoomsByHotelId(id));
    }
  }, [dispatch, id]);

  const images = hotel?.photos;

  return (
    <div className="container max-w-7xl mx-auto">
      <div className="text-center text-[#5a4331] text-base sm:text-lg md:text-xl flex flex-col pt-[40px] pb-[40px] sm:px-6 lg:px-8 gap-y-6">
        <h1 className="font-normal ">Welcome to {hotel?.name} </h1>
        <h2 className="font-normal">{hotel?.description}</h2>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p>Lỗi: {error}</p>}

      <div className="w-full max-w-5xl mx-auto py-6">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          loop
          className="rounded-2xl overflow-hidden"
        >
          {images?.map((src, idx) => (
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
      <div className="flex flex-wrap justify-center gap-6 pt-10 pb-10">
        {hotelRooms.map((room) => (
          <div
            key={room.id}
            className="bg-[#f0ebe8] rounded-xl w-[410px] text-center "
          >
            <img
              alt="Barcelona city view with famous mosaic bench and skyline under blue sky with clouds"
              className="w-full h-48 object-cover rounded-xl"
              src={room.photos[0]}
            />
            <div className="py-6 text-2xl text-[#5a4331] ">
              <h2 className=" mb-1">{room.name}</h2>
              <p className="mb-4">{room.address}</p>
              <button
                onClick={() => router.push(`/rooms/${room.id}`)}
                className="border border-[#5a4331] rounded-full px-5 py-1 hover:bg-[#5a4331] hover:text-white transition cursor-pointer"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
