"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchHotels } from "../../../store/features/hotelSlice";
import { fetchRoomsByHotelId } from "../../../store/features/roomSlice";

import Loading from "@/components/common/Loading";
import Map from "@/components/common/Map";

export default function HotelDetail() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const dispatch = useDispatch();
  const { hotelRooms, loading, error } = useSelector((state) => state.rooms);
  const { data: hotels } = useSelector((state) => state.hotels);

  const hotel = hotels.find((h) => String(h.id) === id);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showAllImages, setShowAllImages] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Refs for sections
  const overviewRef = useRef(null);
  const roomsRef = useRef(null);
  const locationRef = useRef(null);
  const amenitiesRef = useRef(null);
  const reviewsRef = useRef(null);

  // Fetch hotels if not loaded
  useEffect(() => {
    if (!hotels || hotels.length === 0) {
      dispatch(fetchHotels());
    }
  }, [dispatch, hotels]);

  // Fetch rooms + reviews
  useEffect(() => {
    if (id) {
      dispatch(fetchRoomsByHotelId(id));
      fetchReviews();
    }
  }, [dispatch, id]);

  const fetchReviews = async () => {
    if (!id) return;
    setLoadingReviews(true);

    try {
      const res = await fetch(`/api/reviews?hotel_id=${id}`);
      const data = await res.json();
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInDays === 0) return "Hôm nay";
    if (diffInDays === 1) return "Hôm qua";
    if (diffInDays < 7) return `Cách đây ${diffInDays} ngày`;
    if (diffInWeeks === 1) return "Đánh giá cách đây 1 tuần";
    if (diffInWeeks < 4) return `Đánh giá cách đây ${diffInWeeks} tuần`;
    if (diffInMonths === 1) return "Đánh giá cách đây 1 tháng";
    if (diffInMonths < 12) return `Đánh giá cách đây ${diffInMonths} tháng`;
    if (diffInYears === 1) return "Đánh giá cách đây 1 năm";
    return `Đánh giá cách đây ${diffInYears} năm`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const getStars = (rating) =>
    Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? "text-amber-400" : "text-gray-300"
        }`}
      ></i>
    ));

  const images = hotel?.photos || [];
  const displayImages = showAllImages ? images : images.slice(0, 6);
  
  // Tính giá tối thiểu từ các phòng
  const minPrice = hotelRooms.length > 0
    ? Math.min(...hotelRooms.map(room => room.price_per_night || 0))
    : 0;

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết!");
    }
  };

  const tabs = [
    { id: "overview", label: "Tổng quan" },
    { id: "rooms", label: "Phòng" },
    { id: "location", label: "Vị trí" },
    { id: "amenities", label: "Tiện ích" },
    { id: "reviews", label: "Đánh giá" },
  ];

  // Map tab IDs to refs
  const sectionRefs = {
    overview: overviewRef,
    rooms: roomsRef,
    location: locationRef,
    amenities: amenitiesRef,
    reviews: reviewsRef,
  };

  // Scroll to section function
  const scrollToSection = (tabId) => {
    setIsScrolling(true);
    const ref = sectionRefs[tabId];
    if (ref?.current) {
      const offset = 80; // Offset for sticky header
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveTab(tabId);
    }
    setTimeout(() => setIsScrolling(false), 1000);
  };

  // Scroll handler to detect which section is active
  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const offset = 150; // Offset for sticky header

      // Find the section that is currently most visible
      let activeSectionId = null;
      let maxScore = 0;

      tabs.forEach((tab) => {
        const ref = sectionRefs[tab.id];
        if (!ref?.current) return;

        const rect = ref.current.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementBottom = elementTop + rect.height;
        const elementHeight = rect.height;

        // Calculate visibility score
        const visibleTop = Math.max(elementTop, scrollY + offset);
        const visibleBottom = Math.min(elementBottom, scrollY + viewportHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        
        // Score based on how much of the section is visible and its position
        const visibilityRatio = visibleHeight / elementHeight;
        const positionScore = visibleTop <= scrollY + offset + 100 ? 1 : 0.5;
        const score = visibilityRatio * positionScore;

        if (score > maxScore && visibleHeight > 100) {
          maxScore = score;
          activeSectionId = tab.id;
        }
      });

      // Special case for overview (at the top)
      if (scrollY < 300) {
        activeSectionId = "overview";
      }

      if (activeSectionId && activeSectionId !== activeTab) {
        setActiveTab(activeSectionId);
      }
    };

    // Throttle scroll events
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", throttledScroll);
    };
  }, [isScrolling, activeTab, hotelRooms, reviews]);

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Khách sạn", href: "/hotels" },
    { label: `${hotels.length} Khách sạn ở Việt Nam`, href: "/hotels" },
    { label: hotel?.location || "Đà Nẵng", href: `/hotels?location=${hotel?.location}` },
    { label: hotel?.name || "" },
  ];

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <Loading message="Đang tải thông tin khách sạn..." color="amber" />
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f9f9f9]">
      {/* =================== NAVIGATION TABS =================== */}
      <div className="bg-white border-b border-gray-200 sticky top-[81px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Tabs */}
            <div className="flex items-center gap-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => scrollToSection(tab.id)}
                  className={`px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-amber-700 border-b-2 border-amber-700"
                      : "text-gray-600 hover:text-amber-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Utility Buttons */}
            <div className="flex items-center gap-4 ml-4">
              <button
                onClick={copyLink}
                className="flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors text-sm"
              >
                <i className="far fa-copy"></i>
                <span className="hidden sm:inline">Copy link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================== BREADCRUMBS =================== */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-amber-700 transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-gray-900">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* =================== IMAGE GALLERY GRID =================== */}
      {images.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-2 h-[500px]">
            {/* Large Image - Left */}
            <div className="col-span-2 row-span-2 relative rounded-lg overflow-hidden">
              <Image
                src={images[0]}
                alt={hotel.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Small Images - Right (only 2 images) */}
            {images.slice(1, 3).map((src, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowAllImages(true)}
              >
                <Image
                  src={src}
                  alt={`${hotel.name} - ${idx + 2}`}
                  fill
                  className="object-cover"
                />
                {idx === 1 && images.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
                    <div className="text-center">
                      <i className="fas fa-images text-2xl mb-2"></i>
                      <p>Xem tất cả hình ảnh</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================== HOTEL INFO HEADER (OVERVIEW) =================== */}
      <div ref={overviewRef} className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
            {/* Left: Name, Type, Rating */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-[#5a4330] mb-2">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gray-600">Khách Sạn</span>
                <div className="flex items-center gap-1">
                  {getStars(5)}
                </div>
                {hotel?.average_rating && (
                  <span className="text-sm text-gray-600">
                    Hạng 1 trong số Khách sạn và Khu nghỉ dưỡng 5 sao ở{" "}
                    {hotel.location || "Đà Nẵng"}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Price and Booking Button */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">
                  Giá/phòng/đêm từ
                </p>
                {minPrice > 0 ? (
                  <p className="text-3xl font-bold text-amber-700">
                    {formatPrice(minPrice)} VND
                  </p>
                ) : (
                  <p className="text-lg text-gray-500">Liên hệ</p>
                )}
              </div>
              <button
                onClick={() => scrollToSection("rooms")}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
              >
                Chọn phòng
              </button>
            </div>
          </div>

          {/* =================== THREE COLUMNS SECTION =================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Reviews */}
            <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4">
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-amber-700">
                    {hotel?.average_rating
                      ? parseFloat(hotel.average_rating).toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="text-2xl text-gray-400">/10</span>
                </div>
                <p className="text-lg font-semibold text-amber-700 mb-1">
                  Xuất sắc
                </p>
                <button
                  onClick={() => scrollToSection("reviews")}
                  className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  {reviews.length} đánh giá
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>

              <h3 className="font-bold text-[#5a4330] mb-3 text-lg">
                Khách nói gì về kỳ nghỉ của họ
              </h3>

              {/* Category Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { label: "Phòng Ngủ", count: 20 },
                  { label: "Khoảng Cách Đến Trung Tâm", count: 19 },
                  { label: "Khu Vực Xung Quanh", count: 19 },
                  { label: "Nhân Viên Thân Thiện", count: 19 },
                ].map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium"
                  >
                    {tag.label} ({tag.count})
                  </span>
                ))}
              </div>

              {/* Recent Reviews */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {reviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="bg-white rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-semibold text-[#5a4330] text-sm">
                        {review.user_name}
                      </span>
                      <div className="flex items-center gap-1 text-amber-700">
                        <i className="fas fa-star text-xs"></i>
                        <span className="text-sm font-semibold">
                          {review.rating.toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-3">
                      {review.comment || "Không có nhận xét"}
                    </p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Chưa có đánh giá
                  </p>
                )}
              </div>
            </div>

            {/* Middle Column: Location */}
            <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#5a4330] text-lg">
                  Trong khu vực
                </h3>
                <button
                  onClick={() => scrollToSection("location")}
                  className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Xem bản đồ
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>

              {/* Address */}
              {hotel.address && (
                <div className="mb-4">
                  <div className="flex items-start gap-2 text-gray-700 text-sm mb-3">
                    <i className="fas fa-map-marker-alt text-amber-700 mt-1"></i>
                    <span>{hotel.address}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    <i className="fas fa-building"></i>
                    Gần khu vui chơi giải trí
                  </span>
                </div>
              )}

              {/* Nearby Places */}
              <div className="space-y-2">
                {[
                  { name: "Cầu sông Hàn", distance: "514 m" },
                  { name: "Ga Đà Nẵng", distance: "2.09 km" },
                  {
                    name: "Bệnh viện Đa khoa Gia Đình Đà Nẵng",
                    distance: "2.84 km",
                  },
                  { name: "Chợ Hàn", distance: "576 m" },
                  { name: "Bến Du Thuyền Đà Nẵng", distance: "746 m" },
                  { name: "Nhà thờ chính tòa Đà Nẵng", distance: "784 m" },
                ].map((place, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 px-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-gray-700">
                      <i className="fas fa-map-marker-alt text-amber-700 text-xs"></i>
                      <span>{place.name}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Amenities */}
            <div className="lg:col-span-1 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[#5a4330] text-lg">
                  Tiện ích chính
                </h3>
                <button
                  onClick={() => scrollToSection("amenities")}
                  className="text-amber-700 hover:text-amber-800 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                  Xem thêm
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    icon: "fas fa-snowflake",
                    label: "Máy lạnh",
                  },
                  {
                    icon: "fas fa-parking",
                    label: "Chỗ đậu xe",
                  },
                  {
                    icon: "fas fa-utensils",
                    label: "Nhà hàng",
                  },
                  {
                    icon: "fas fa-elevator",
                    label: "Thang máy",
                  },
                  {
                    icon: "fas fa-swimming-pool",
                    label: "Hồ bơi",
                  },
                  {
                    icon: "fas fa-wifi",
                    label: "WiFi",
                  },
                  {
                    icon: "fas fa-clock",
                    label: "Lễ tân 24h",
                  },
                ].map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-gray-700 py-2 px-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <i className={`${amenity.icon} text-amber-700 w-4 flex-shrink-0`}></i>
                    <span className="text-sm">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================== ROOMS LIST SECTION =================== */}
      <div ref={roomsRef} className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#5a4330] mb-6">
            Phòng hiện có tại khách sạn
          </h2>

          {loading && (
            <Loading message="Đang tải danh sách phòng..." color="amber" />
          )}
          {error && <p className="text-red-500">{error}</p>}

          {hotelRooms.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-bed text-4xl mb-3"></i>
              <p>Chưa có phòng nào</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelRooms.map((room) => (
              <div
                key={room.id}
                className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200"
              >
                {/* Room Image */}
                {room.photos?.[0] && (
                  <div className="relative h-56">
                    <Image
                      src={room.photos[0]}
                      alt={room.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Room Info */}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-[#5a4330] mb-2">
                    {room.name}
                  </h3>

                  {room.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Giá/đêm</p>
                      <p className="text-xl font-bold text-amber-700">
                        {formatPrice(room.price_per_night || 0)} VND
                      </p>
                    </div>
                    {room.max_people && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Số người</p>
                        <p className="text-lg font-semibold text-[#5a4330]">
                          {room.max_people}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================== LOCATION & SURROUNDINGS SECTION =================== */}
      <div ref={locationRef} className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Header */}
          <h2 className="text-3xl font-bold text-[#5a4330] mb-4">
            Xung quanh {hotel.name} có gì
          </h2>
          
          {/* Address */}
          {hotel.address && (
            <div className="flex items-start gap-2 text-gray-700 mb-6">
              <i className="fas fa-map-marker-alt text-amber-700 mt-1"></i>
              <span className="text-lg">{hotel.address}</span>
            </div>
          )}

          {/* Map Section */}
          {hotel.map_url && (
            <div className="mb-6">
              <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
                <Map mapUrl={hotel.map_url} />
              </div>
              
              {/* Tags and Explore Button */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <i className="fas fa-gamepad"></i>
                    Gần khu vui chơi giải trí
                  </span>
                  <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                    <i className="fas fa-map-marker-alt"></i>
                    Gần Hàn Market
                  </span>
                </div>
                <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i className="fas fa-map-marker-alt"></i>
                  Khám phá nhiều địa điểm hơn
                </button>
              </div>
            </div>
          )}

          {/* Nearby Information - 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Column 1: Địa Điểm Lân Cận */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#5a4330] mb-4">
                <i className="fas fa-map-marker-alt text-amber-700"></i>
                Địa Điểm Lân Cận
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Cầu sông Hàn", distance: "514 m" },
                  { name: "Chợ Hàn", distance: "576 m" },
                  { name: "Bến Du Thuyền Đà Nẵng", distance: "746 m" },
                  { name: "Nhà thờ chính tòa Đà Nẵng", distance: "784 m" },
                  { name: "Bảo tàng Mỹ thuật Đà Nẵng", distance: "1.2 km" },
                ].map((place, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700">{place.name}</span>
                    <span className="text-gray-500 font-medium">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Trung tâm Giao thông */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#5a4330] mb-4">
                <i className="fas fa-bus text-amber-700"></i>
                Trung tâm Giao thông
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Ga Đà Nẵng", distance: "2.09 km" },
                  { name: "Số 294 Trưng Nữ Vương", distance: "2.29 km" },
                  { name: "Bến xe khách Đà Nẵng", distance: "3.5 km" },
                  { name: "Sân bay Quốc tế Đà Nẵng", distance: "5.8 km" },
                ].map((place, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700">{place.name}</span>
                    <span className="text-gray-500 font-medium">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Trung tâm giải trí */}
            <div>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-[#5a4330] mb-4">
                <i className="fas fa-gamepad text-amber-700"></i>
                Trung tâm giải trí
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Cầu sông Hàn", distance: "514 m" },
                  { name: "Cầu Rồng", distance: "1.09 km" },
                  { name: "Công viên Biển Đông", distance: "2.3 km" },
                  { name: "Sun World Ba Na Hills", distance: "25 km" },
                ].map((place, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-gray-700">{place.name}</span>
                    <span className="text-gray-500 font-medium">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================== AMENITIES SECTION =================== */}
      <div ref={amenitiesRef} className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Header */}
          <h2 className="text-3xl font-bold text-[#5a4330] mb-6">
            Tiện ích tại {hotel.name}
          </h2>

          {/* Amenities Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "fas fa-wifi",
                label: "Wi-Fi miễn phí",
                category: "Internet",
              },
              {
                icon: "fas fa-swimming-pool",
                label: "Bể bơi",
                category: "Giải trí",
              },
              {
                icon: "fas fa-dumbbell",
                label: "Phòng gym",
                category: "Thể thao",
              },
              {
                icon: "fas fa-utensils",
                label: "Nhà hàng",
                category: "Ẩm thực",
              },
              {
                icon: "fas fa-concierge-bell",
                label: "Dịch vụ dọn phòng",
                category: "Dịch vụ",
              },
              {
                icon: "fas fa-clock",
                label: "Lễ tân 24/7",
                category: "Dịch vụ",
              },
              {
                icon: "fas fa-parking",
                label: "Bãi đỗ xe",
                category: "Tiện ích",
              },
              {
                icon: "fas fa-spa",
                label: "Spa & Massage",
                category: "Chăm sóc sức khỏe",
              },
              {
                icon: "fas fa-cocktail",
                label: "Bar",
                category: "Giải trí",
              },
              {
                icon: "fas fa-snowflake",
                label: "Máy lạnh",
                category: "Tiện ích",
              },
              {
                icon: "fas fa-elevator",
                label: "Thang máy",
                category: "Tiện ích",
              },
              {
                icon: "fas fa-shield-alt",
                label: "An ninh 24/7",
                category: "An toàn",
              },
              {
                icon: "fas fa-tshirt",
                label: "Dịch vụ giặt ủi",
                category: "Dịch vụ",
              },
              {
                icon: "fas fa-business-time",
                label: "Trung tâm kinh doanh",
                category: "Công việc",
              },
              {
                icon: "fas fa-baby",
                label: "Dịch vụ trông trẻ",
                category: "Dịch vụ",
              },
              {
                icon: "fas fa-paw",
                label: "Cho phép thú cưng",
                category: "Tiện ích",
              },
            ].map((amenity, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <i className={`${amenity.icon} text-amber-700 text-2xl mb-2`}></i>
                <span className="text-sm font-medium text-[#5a4330] text-center">
                  {amenity.label}
                </span>
                <span className="text-xs text-gray-500">{amenity.category}</span>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-[#5a4330] mb-4">
              Tiện ích bổ sung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                  <p className="font-medium text-gray-800">Dịch vụ đưa đón sân bay</p>
                  <p className="text-sm text-gray-600">
                    Miễn phí đưa đón từ sân bay đến khách sạn
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                  <p className="font-medium text-gray-800">Dịch vụ đổi tiền</p>
                  <p className="text-sm text-gray-600">
                    Quầy đổi tiền tại lễ tân 24/7
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                  <p className="font-medium text-gray-800">Dịch vụ đặt tour</p>
                  <p className="text-sm text-gray-600">
                    Hỗ trợ đặt tour du lịch và vé tham quan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <div>
                  <p className="font-medium text-gray-800">Dịch vụ thuê xe</p>
                  <p className="text-sm text-gray-600">
                    Thuê xe máy và xe đạp để khám phá thành phố
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================== CUSTOMER REVIEWS SECTION =================== */}
      <div ref={reviewsRef} className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Đánh giá của khách hàng
          </h2>

          {loadingReviews ? (
            <Loading message="Đang tải đánh giá..." color="amber" />
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-comment-slash text-4xl mb-3"></i>
              <p>Chưa có đánh giá nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.slice(0, 5).map((review, index) => (
                <div
                  key={review.id}
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    {/* Left: Avatar and User Info */}
                    <div className="flex items-start gap-3 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        {review.user_avatar ? (
                          <Image
                            src={review.user_avatar}
                            width={48}
                            height={48}
                            className="rounded-full"
                            alt={review.user_name}
                          />
                        ) : (
                          <i className="fas fa-user text-gray-400 text-xl"></i>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900">
                            Khách đã xác minh
                          </span>
                        </div>
                        {/* Optional: Trip type tag */}
                        {index === 1 && (
                          <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                            <i className="far fa-moon"></i>
                            <span>Công tác</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Rating and Date */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <i className="fas fa-check-circle text-blue-500"></i>
                        <span className="text-lg font-bold text-blue-600">
                          {review.rating.toFixed(1)}/10
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {getTimeAgo(review.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.comment && (
                    <p className="text-gray-800 mb-4 leading-relaxed">
                      {review.comment}
                    </p>
                  )}

                  {/* Helpfulness */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                      <i className="far fa-thumbs-up text-blue-500"></i>
                      <span className="text-sm">
                        {index === 0
                          ? "Đánh giá này hữu ích không?"
                          : `${index} người nghĩ đánh giá này hữu ích`}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Reviews Button */}
          {reviews.length > 5 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => scrollToSection("reviews")}
                className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Xem tất cả {reviews.length} đánh giá
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =================== TAB CONTENT =================== */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
      
        {/* Rooms Tab */}
        {activeTab === "rooms" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-6">
              Phòng hiện có tại khách sạn
            </h2>

            {loading && (
              <Loading message="Đang tải danh sách phòng..." color="amber" />
            )}
            {error && <p className="text-red-500">{error}</p>}

            {hotelRooms.length === 0 && !loading && (
              <div className="text-center text-gray-500 py-8">
                <i className="fas fa-bed text-4xl mb-3"></i>
                <p>Chưa có phòng nào</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotelRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-gray-50 rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-gray-200"
                >
                  {/* Room Image */}
                  {room.photos?.[0] && (
                    <div className="relative h-56">
                      <Image
                        src={room.photos[0]}
                        alt={room.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Room Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-[#5a4330] mb-2">
                      {room.name}
                    </h3>

                    {room.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Giá/đêm</p>
                        <p className="text-xl font-bold text-amber-700">
                          {formatPrice(room.price_per_night || 0)} VND
                        </p>
                      </div>
                      {room.max_people && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Số người</p>
                          <p className="text-lg font-semibold text-[#5a4330]">
                            {room.max_people}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => router.push(`/rooms/${room.id}`)}
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Tab */}
        {activeTab === "location" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-4">
              Vị trí khách sạn
            </h2>
            {hotel.address && (
              <p className="text-gray-700 mb-4">
                <i className="fas fa-map-marker-alt text-amber-700 mr-2"></i>
                {hotel.address}
              </p>
            )}
            {hotel.map_url ? (
              <Map mapUrl={hotel.map_url} />
            ) : (
              <div className="bg-gray-100 rounded-lg p-12 text-center text-gray-500">
                <i className="fas fa-map text-4xl mb-3"></i>
                <p>Chưa có bản đồ</p>
              </div>
            )}
          </div>
        )}

        {/* Amenities Tab */}
        {activeTab === "amenities" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-4">
              Tiện ích
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                "Wi-Fi miễn phí",
                "Bể bơi",
                "Phòng gym",
                "Nhà hàng",
                "Dịch vụ dọn phòng",
                "Lễ tân 24/7",
                "Bãi đỗ xe",
                "Spa & Massage",
                "Bar",
              ].map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <i className="fas fa-check-circle text-amber-700"></i>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies Tab */}
        {activeTab === "policies" && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[#5a4330] mb-4">
              Chính sách
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#5a4330] mb-2">
                  Chính sách nhận phòng
                </h3>
                <p className="text-gray-700">
                  Nhận phòng từ 14:00, trả phòng trước 12:00
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#5a4330] mb-2">
                  Chính sách hủy phòng
                </h3>
                <p className="text-gray-700">
                  Miễn phí hủy trước 24 giờ. Sau đó sẽ tính phí hủy phòng.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#5a4330] mb-2">
                  Chính sách thanh toán
                </h3>
                <p className="text-gray-700">
                  Chấp nhận thanh toán qua MoMo, VNPay, chuyển khoản ngân hàng và tiền mặt.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================== ALL IMAGES MODAL =================== */}
      {showAllImages && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllImages(false)}
        >
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((src, idx) => (
                <div key={idx} className="relative h-64 rounded-lg overflow-hidden">
                  <Image
                    src={src}
                    alt={`${hotel.name} - ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowAllImages(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-amber-400 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
