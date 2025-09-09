"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../../../app/store/features/hotelSlice";

const CategoryHotel = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: hotels, loading, error } = useSelector((state) => state.hotels);

  console.log("Hotels data:", hotels);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  return (
    <div className="flex flex-wrap justify-center gap-6 pt-10 pb-10">
      {hotels.map((hotel, key) => (
        <div
          key={key}
          className="bg-[#f0ebe8] rounded-xl w-[410px] text-center "
        >
          <img
            alt="Barcelona city view with famous mosaic bench and skyline under blue sky with clouds"
            className="w-full h-48 object-cover rounded-xl"
            src={hotel.photos[0]}
          />
          <div className="py-6 text-2xl text-[#5a4331] ">
            <h2 className=" mb-1">{hotel.name}</h2>
            <p className="mb-4">{hotel.address}</p>
            <button
              onClick={() => router.push(`/hotels/${hotel.id}`)}
              className="border border-[#5a4331] rounded-full px-5 py-1 hover:bg-[#5a4331] hover:text-white transition cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      ))}

      {/* Static hotel cards for Barcelona */}
    </div>
  );
};

export default CategoryHotel;
