"use client";

import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import slider1 from "../../../public/assets/images/slider1.jpg";
import slider2 from "../../../public/assets/images/slider2.jpg";
import slider3 from "../../../public/assets/images/slider3.jpg";

import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function BannerSlider() {
  return (
    <div>
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop={true}
        allowTouchMove={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="w-full h-[800px] custom-swiper  "
      >
        <SwiperSlide>
          <Image
            src={slider1}
            alt="slider1"
            layout="fill"
            className="object-cover animate-[zoom-in_5s_ease-in-out_forwards]"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl font-bold">Feel the nature</h1>
          </div>
        </SwiperSlide>
        <SwiperSlide className="relative">
          <Image
            src={slider2}
            alt="slider2"
            layout="fill"
            className="object-cover animate-[zoom-in_5s_ease-in-out_forwards]"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl font-bold">Feel the nature</h1>
          </div>
        </SwiperSlide>
        <SwiperSlide className="relative">
          <Image
            src={slider3}
            alt="slider3"
            layout="fill"
            className="object-cover animate-[zoom-in_5s_ease-in-out_forwards]"
            draggable={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-5xl font-bold">Feel the nature</h1>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}


{/* <form aria-label="Booking form" class="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-white rounded-full flex flex-wrap gap-4 px-6 py-4 max-w-6xl w-[90%] md:w-[85%] lg:w-[75%]">
    <div class="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
     <i class="fas fa-search text-[#5a3f26]">
     </i>
     <span>
      The Bloom
     </span>
     <i class="fas fa-chevron-down text-xs">
     </i>
    </div>
    <div class="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
     <i class="far fa-calendar-alt text-[#5a3f26]">
     </i>
     <span>
      Jun 02, 2025
     </span>
     <span class="text-gray-400 text-xs">
      →
     </span>
     <span>
      Jun 03, 2025
     </span>
    </div>
    <div class="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
     <i class="fas fa-user-friends text-[#5a3f26]">
     </i>
     <span>
      1 room 3 adults
     </span>
     <i class="fas fa-chevron-down text-xs">
     </i>
    </div>
    <div class="flex items-center space-x-3 border border-gray-300 rounded-full px-5 py-3 text-[#5a3f26] text-sm font-serif cursor-pointer min-w-[140px] md:min-w-[180px]">
     <i class="fas fa-tags text-[#5a3f26]">
     </i>
     <span>
      Promotional Code
     </span>
    </div>
    <button class="bg-[#5a3f26] text-white rounded-full px-6 py-3 text-sm font-serif font-normal min-w-[80px] md:min-w-[100px] hover:bg-[#4a3320] transition-colors" type="submit">
     Book
    </button>
   </form> */}
