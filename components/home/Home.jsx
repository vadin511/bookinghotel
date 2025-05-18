"use client";

import { useEffect, useRef, useState } from "react";
import CategoryHotel from "../home/categoryhotel/CategoryHotel";
import BannerNews from "./bannerNews/BannerNews";
import BannerSlider from "./bannerSlider/BannerSlider";
import CategorySlider from "./categorySlider/CategorySlider";
import IntroHome from "./introHome/IntroHome";
import SearchRoom from "./searchRoom/SearchRoom";

const Home = () => {
  const [isFixed, setIsFixed] = useState(false);
  const bannerRef = useRef(null);
  const introRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const bannerBottom =
        bannerRef.current?.getBoundingClientRect().bottom || 0;

      const footerEl = document.querySelector("footer");
      const footerTop = footerEl?.getBoundingClientRect().top || Infinity;

      // Nếu cuộn lên gần banner → quay lại vị trí ban đầu
      if (bannerBottom > window.innerHeight / 2) {
        setIsFixed(false);
      }
      // Nếu footer hiện trong viewport → ẩn SearchRoom
      else if (footerTop < window.innerHeight) {
        setIsFixed(false);
      }
      // Ngược lại → hiện SearchRoom fixed
      else {
        setIsFixed(true);
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Slider + SearchRoom */}
      <div ref={bannerRef} className="relative h-[600px]">
        <BannerSlider />
        {!isFixed && (
          <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 z-30 container max-w-7xl mx-auto w-full ">
            <SearchRoom />
          </div>
        )}
      </div>

      {/* SearchRoom Fixed khi cuộn */}
      {isFixed && (
        <div
          ref={searchRef}
          className="fixed top-[60px] left-1/2 transform -translate-x-1/2 z-50 container max-w-7xl mx-auto w-full transition-all duration-300"
        >
          <div>
            <SearchRoom />
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="container max-w-7xl mx-auto mt-50 mb-10" ref={introRef}>
        <IntroHome />
        <CategoryHotel />
        <CategorySlider />
        <BannerNews />
      </div>
    </div>
  );
};

export default Home;
