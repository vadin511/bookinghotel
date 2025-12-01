"use client";

import { useEffect, useRef, useState } from "react";
import CategoryHotel from "../home/categoryhotel/CategoryHotel";
import BannerNews from "./bannerNews/BannerNews";
import BannerSlider from "./bannerSlider/BannerSlider";
import IntroHome from "./introHome/IntroHome";
import LatestPosts from "./latestPosts/LatestPosts";
import SearchRoom from "./searchRoom/SearchRoom";
import DestinationPlanning from "./destinationPlanning/DestinationPlanning";

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
      {/* Slider */}
      <div ref={bannerRef} className="relative -mt-12 sm:-mt-16 md:-mt-20">
        <BannerSlider />
      </div>

      {/* SearchRoom - Nằm giữa slider và nội dung */}
      {!isFixed && (
        <div className="container max-w-7xl mx-auto -mt-3 sm:-mt-7 md:-mt-11 lg:-mt-15 relative z-30 px-2 sm:px-4">
          <SearchRoom />
        </div>
      )}

      {/* SearchRoom Fixed khi cuộn */}
      {isFixed && (
        <div
          ref={searchRef}
          className="fixed top-[60px] sm:top-[70px] md:top-[80px] left-1/2 transform -translate-x-1/2 z-50 container max-w-7xl mx-auto w-full transition-all duration-300 px-2 sm:px-4"
        >
          <div>
            <SearchRoom />
          </div>
        </div>
      )}

      {/* Nội dung chính */}
      <div className="container max-w-7xl mx-auto mt-5 mb-10 px-2 sm:px-4" ref={introRef}>
        <IntroHome />
        <CategoryHotel />
      </div>
      
      {/* DestinationPlanning - Full width */}
      <DestinationPlanning />
      
      {/* Nội dung tiếp theo */}
      <div className="container max-w-7xl mx-auto mb-10 px-2 sm:px-4">
        <LatestPosts />
      </div>
      
      {/* BannerNews - Full width */}
      <BannerNews />
    </div>
  );
};

export default Home;
