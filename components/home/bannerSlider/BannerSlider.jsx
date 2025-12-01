"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { Autoplay, Navigation, Pagination, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
// Fallback images nếu không có banner nào
import slider1 from "../../../public/assets/images/slider1.jpg";
import slider2 from "../../../public/assets/images/slider2.jpg";
import slider3 from "../../../public/assets/images/slider3.jpg";

export default function BannerSlider() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners", {
        credentials: "include",
        cache: "no-store", // Không cache để luôn lấy dữ liệu mới nhất
      });
      if (res.ok) {
        const data = await res.json();
        // Chỉ lấy banners đang active
        const activeBanners = data.filter((b) => b.is_active === 1);
        setBanners(activeBanners);
      }
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch lần đầu
    fetchBanners();

    // Tự động refresh mỗi 30 giây
    const interval = setInterval(() => {
      fetchBanners();
    }, 30000); // 30 giây

    // Refresh khi tab được focus lại (người dùng quay lại trang)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBanners();
      }
    };

    // Refresh khi window được focus
    const handleFocus = () => {
      fetchBanners();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Fallback images nếu không có banner nào
  const fallbackImages = [
    { id: "fallback-1", image_url: slider1.src, title: "Cảm nhận thiên nhiên", link: null },
    { id: "fallback-2", image_url: slider2.src, title: "Cảm nhận thiên nhiên", link: null },
    { id: "fallback-3", image_url: slider3.src, title: "Cảm nhận thiên nhiên", link: null },
  ];
  const displayBanners = banners.length > 0 ? banners : fallbackImages;

  if (loading && banners.length === 0) {
    return (
      <div className="custom-swiper relative w-full h-[400px] sm:h-[500px] md:h-[600px] bg-gray-200 animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">Đang tải banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-swiper relative w-full h-[400px] sm:h-[500px] md:h-[600px] z-0">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={displayBanners.length > 1}
        speed={1000}
        effect="fade"
        fadeEffect={{
          crossFade: true,
        }}
        allowTouchMove={false}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="max-w-9xl h-full"
      >
        {displayBanners.map((banner, idx) => {
          const imageSrc = banner.image_url;
          const title = banner.title || "";
          const linkUrl = banner.link;

          return (
            <SwiperSlide key={banner.id || idx} className="relative w-full h-full">
              {linkUrl ? (
                <a href={linkUrl} className="block w-full h-full">
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0}
                    draggable={false}
                  />
                  {title && (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg text-center">{title}</h1>
                    </div>
                  )}
                </a>
              ) : (
                <>
                  <Image
                    src={imageSrc}
                    alt={title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    priority={idx === 0}
                    draggable={false}
                  />
                  {title && (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                      <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-lg text-center">{title}</h1>
                    </div>
                  )}
                </>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
