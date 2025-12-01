"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const DestinationPlanning = () => {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Thành phố");
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch danh sách locations từ API
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/locations");
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        } else {
          console.error("Error fetching locations");
          setDestinations([]);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setDestinations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Danh sách filter buttons
  const filters = [
    { id: "Thành phố", label: "Thành phố", icon: "fas fa-building" },
    { id: "Bãi biển", label: "Bãi biển", icon: "fas fa-water" },
    { id: "Thiên nhiên", label: "Thiên nhiên", icon: "fas fa-bicycle" },
    { id: "Thư giãn", label: "Thư giãn", icon: "fas fa-spa" },
    { id: "Lãng mạn", label: "Lãng mạn", icon: "fas fa-heart" },
    { id: "Ẩm thực", label: "Ẩm thực", icon: "fas fa-utensils" },
  ];

  // Xử lý click vào destination card
  const handleDestinationClick = (destinationName) => {
    router.push(`/search?location=${encodeURIComponent(destinationName)}`);
  };

  // Destinations đã được filter từ API (chỉ những locations có khách sạn)
  const filteredDestinations = destinations;

  return (
    <div className="bg-[#472E1E]">
      <div className="w-full py-12 px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Lên kế hoạch dễ dàng và nhanh chóng
          </h2>
          <p className="text-base md:text-lg text-white">
            Khám phá các điểm đến hàng đầu theo cách bạn thích ở Việt Nam
          </p>
        </div>

        {/* Filter Bar */}
        <div className="mb-8 flex flex-wrap gap-3 justify-center md:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200
                ${
                  activeFilter === filter.id
                    ? "bg-amber-50 border-amber-700 text-[#5a4331]"
                    : "bg-white border-gray-300 text-[#5a4331] hover:border-amber-500"
                }
              `}
            >
              <i className={`${filter.icon} text-lg`}></i>
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Destination Cards - Swiper Slider */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Đang tải thông tin các điểm đến...
            </p>
          </div>
        ) : filteredDestinations.length > 0 ? (
          <div className="relative destination-swiper-container">
            <Swiper
              modules={[Autoplay, Navigation]}
              spaceBetween={16}
              slidesPerView={1}
              slidesPerGroup={1}
              loop={filteredDestinations.length >= 4}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={{
                nextEl: ".destination-swiper-button-next",
                prevEl: ".destination-swiper-button-prev",
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  slidesPerGroup: 2,
                },
                768: {
                  slidesPerView: 3,
                  slidesPerGroup: 3,
                },
                1024: {
                  slidesPerView: 4,
                  slidesPerGroup: 4,
                },
              }}
              className="destination-swiper"
            >
              {filteredDestinations.map((destination) => (
                <SwiperSlide key={destination.id}>
                  <div
                    onClick={() => handleDestinationClick(destination.name)}
                    className="cursor-pointer group h-full"
                  >
                    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
                      {/* Image */}
                      <div className="relative w-full h-[280px] overflow-hidden">
                        <Image
                          src={destination.image}
                          alt={destination.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-4 flex-1">
                        <h3 className="font-bold text-lg text-[#5a4331] mb-2">
                          {destination.name}
                        </h3>
                        <p className="text-sm text-[#5a4331]">
                          {destination.hotelCount || 0} khách sạn
                        </p>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Navigation Buttons */}
            <button
              className="destination-swiper-button-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 flex items-center justify-center hover:bg-amber-50 transition-colors duration-200 group"
              aria-label="Previous slide"
            >
              <i className="fas fa-chevron-left text-[#5a4331] text-lg group-hover:text-amber-700"></i>
            </button>
            <button
              className="destination-swiper-button-next absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-lg p-3 flex items-center justify-center hover:bg-amber-50 transition-colors duration-200 group"
              aria-label="Next slide"
            >
              <i className="fas fa-chevron-right text-[#5a4331] text-lg group-hover:text-amber-700"></i>
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Chưa có điểm đến nào
            </p>
          </div>
        )}

        <style jsx global>{`
          .destination-swiper-container {
            padding: 0 50px;
          }
          
          .destination-swiper {
            padding: 20px 0;
          }
          
          .destination-swiper .swiper-slide {
            height: auto;
          }
          
          .destination-swiper-button-prev,
          .destination-swiper-button-next {
            width: 44px;
            height: 44px;
          }
          
          .destination-swiper-button-prev.swiper-button-disabled,
          .destination-swiper-button-next.swiper-button-disabled {
            opacity: 0.35;
            cursor: not-allowed;
          }
          
          @media (max-width: 640px) {
            .destination-swiper-container {
              padding: 0 40px;
            }
            
            .destination-swiper-button-prev,
            .destination-swiper-button-next {
              width: 36px;
              height: 36px;
              padding: 8px;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default DestinationPlanning;

