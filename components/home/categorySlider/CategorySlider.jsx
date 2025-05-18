"use client";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

import { EffectCoverflow, Pagination } from "swiper/modules";

export default function CategorySlider() {
  return (
    <div className="container mx-auto max-w-8xl rounded-lg bg-[#4e3520] pt-30 pb-30 ">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper "
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <SwiperSlide className="w-50" key={num}>
            <img
              src={`https://swiperjs.com/demos/images/nature-${num}.jpg`}
              alt={`Nature ${num}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
