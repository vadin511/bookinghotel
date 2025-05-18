"use client";
import Image from "next/image";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import slider1 from "../../../public/assets/images/slider1.jpg";
import slider2 from "../../../public/assets/images/slider2.jpg";
import slider3 from "../../../public/assets/images/slider3.jpg";

export default function BannerSlider() {
  return (
    <div className="custom-swiper relative w-full h-[800px]">
      <Swiper
        spaceBetween={0}
        centeredSlides
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        allowTouchMove={false}
        modules={[Autoplay, Pagination, Navigation]}
        className="max-w-9xl h-full"
      >
        {[slider1, slider2, slider3].map((img, idx) => (
          <SwiperSlide key={idx} className="relative w-full h-full">
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
    </div>
  );
}
