"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../../../app/store/features/hotelSlice";

const CategoryHotel = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { data: hotels, loading, error } = useSelector((state) => state.hotels);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (error) return <div className="text-center py-10 text-red-600">Lỗi: {error}</div>;

  // Sắp xếp khách sạn theo average_rating giảm dần (cao nhất trước)
  const sortedHotels = [...hotels].sort((a, b) => {
    const ratingA = a.average_rating ? parseFloat(a.average_rating) : 0;
    const ratingB = b.average_rating ? parseFloat(b.average_rating) : 0;
    return ratingB - ratingA;
  });

  // Lấy 3 khách sạn có rating cao nhất
  const featuredHotels = sortedHotels.slice(0, 3);

  // Hàm render sao dựa trên rating thực tế (tối đa 5 sao)
  const renderStars = (rating) => {
    const numRating = rating ? Math.round(parseFloat(rating)) : 0;
    const maxStars = 5;
    const stars = [];
    
    for (let i = 0; i < maxStars; i++) {
      if (i < numRating) {
        // Sao vàng cho phần có rating
        stars.push(
          <i
            key={i}
            className="fas fa-star text-yellow-400 text-lg"
          ></i>
        );
      } else {
        // Sao xám cho phần không có rating
        stars.push(
          <i
            key={i}
            className="fas fa-star text-gray-300 text-lg"
          ></i>
        );
      }
    }
    return stars;
  };

  return (
    <div className="relative pt-10 pb-10">
      {/* Header Banner - Full width, break out of container with brown background */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-8  py-4">
        <div className="relative flex items-center w-full">
          {/* Left line extending from center box */}
          <div className="flex-1 h-3  border-t border-b border-white bg-[#472E1E]"></div>
          
          {/* Central rounded box with title */}
          <div className="bg-[#472E1E] rounded-lg px-8 py-4 shadow-md border border-white">
            <h2 className="text-white font-bold text-3xl whitespace-nowrap">
              Khách Sạn Nổi Bật
            </h2>
          </div>
          
          {/* Right line extending from center box */}
          <div className="flex-1 h-3 border-t border-b bg-[#472E1E]"></div>
        </div>
      </div>

      {/* Hotel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 justify-center px-4 max-w-7xl mx-auto">
        {featuredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg w-full flex flex-col"
          >
            {/* Hotel Image */}
            {hotel.photos && hotel.photos[0] && (
              <div className="relative w-full h-64 rounded-t-xl overflow-hidden">
                <Image
                  alt={`${hotel.name} - ${hotel.address}`}
                  src={hotel.photos[0]}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="object-cover"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Hotel Info */}
            <div className="p-6 flex flex-col flex-grow">
              {/* Hotel Name */}
              <h3 className="text-xl font-bold text-[#472E1E] mb-2">
                {hotel.name}
              </h3>
              
              {/* Address */}
              <p className="text-sm text-gray-600 mb-4">
                {hotel.address}
              </p>
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-6">
                {renderStars(hotel.average_rating)}
              </div>
              
              {/* Details Button */}
              <button
                onClick={() => router.push(`/hotels/${hotel.id}`)}
                className="bg-[#472E1E] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3a2418] transition-colors cursor-pointer mt-auto"
              >
                CHI TIẾT
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Background Gradient */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-gray-100 to-transparent pointer-events-none -z-10"></div>
    </div>
  );
};

export default CategoryHotel;
