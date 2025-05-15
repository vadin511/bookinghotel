"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import slider1 from "../../../public/assets/images/slider1.jpg";
import slider2 from "../../../public/assets/images/slider2.jpg";
import slider3 from "../../../public/assets/images/slider3.jpg";
import SearchRoom from "../searchRoom/SearchRoom";

export default function BannerSlider() {
  const searchRef = useRef(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 600; // chiều cao bạn muốn search dính header
      if (window.scrollY > threshold) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      <Swiper
        spaceBetween={0}
        centeredSlides
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        allowTouchMove={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-[800px]"
      >
        {[slider1, slider2, slider3].map((img, idx) => (
          <SwiperSlide key={idx}>
            <Image
              src={img}
              alt={`slider${idx + 1}`}
              layout="fill"
              className="object-cover"
              draggable={false}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-white text-5xl font-bold">Feel the nature</h1>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        ref={searchRef}
        className={`transition-all duration-300 z-50 w-full px-4 ${
          isSticky
            ? "fixed top-[80px] left-0" // dưới header
            : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        }`}
      >
        <SearchRoom />
      </div>
    </div>
  );
}
