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
      const bannerBottom = bannerRef.current?.getBoundingClientRect().bottom || 0;
      const introTop = introRef.current?.getBoundingClientRect().top || 0;

      // Nếu cuộn lên lại gần đỉnh banner → quay về vị trí giữa banner
      if (bannerBottom > window.innerHeight / 2) {
        setIsFixed(false);
      }
      // Nếu đã cuộn quá intro → không hiển thị nữa
      else if (introTop < 80) {
        setIsFixed(false);
      }
      // Nếu scroll xuống vượt slider → fixed
      else {
        setIsFixed(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Slider + SearchRoom */}
      <div ref={bannerRef} className="relative h-[600px]">
        <BannerSlider />
        {!isFixed && (
          <div className="absolute bottom-[5%] left-1/2 transform -translate-x-1/2 z-30 w-full max-w-7xl px-4">
            <SearchRoom />
          </div>
        )}
      </div>

      {/* SearchRoom Fixed khi cuộn */}
      {isFixed && (
        <div
          ref={searchRef}
          className="fixed top-[44px] left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4 transition-all duration-300"
        >
          <div className=" rounded-xl shadow-lg p-4">
            <SearchRoom />
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <div ref={introRef}>
        <IntroHome />
      </div>
      <CategoryHotel />
      <BannerNews />
      <CategorySlider />
    </>
  );
};

export default Home;
