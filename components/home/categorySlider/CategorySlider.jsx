"use client";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";

import imgCate1 from "../../../public/assets/images/imgCate1.png";
import imgCate2 from "../../../public/assets/images/imgCate2.png";
import imgCate3 from "../../../public/assets/images/imgCate3.png";

import Image from "next/image";
import { EffectCoverflow, Pagination } from "swiper/modules";

export default function CategorySlider() {
  const images = [imgCate1, imgCate2, imgCate3];

  return (
    <div className="container mx-auto max-w-8xl rounded-lg bg-[#4e3520] pt-[120px] pb-[120px]">
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={3}
        initialSlide={1}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={true}
        modules={[EffectCoverflow, Pagination]}
        className="mySwiper"
      >
        {images.map((image, index) => (
          <SwiperSlide className="w-50" key={index}>
            <Image src={image} alt={`category-${index}`} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
