"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import SearchRoom from "../../../components/home/searchRoom/SearchRoom";
import Loading from "@/components/common/Loading";

// Price ranges for filtering - defined outside component to avoid recreation on each render
const PRICE_RANGES = [
  { id: '0-500000', label: 'Dưới 500.000 VND', min: 0, max: 500000 },
  { id: '500000-1000000', label: '500.000 - 1.000.000 VND', min: 500000, max: 1000000 },
  { id: '1000000-2000000', label: '1.000.000 - 2.000.000 VND', min: 1000000, max: 2000000 },
  { id: '2000000-3000000', label: '2.000.000 - 3.000.000 VND', min: 2000000, max: 3000000 },
  { id: '3000000-5000000', label: '3.000.000 - 5.000.000 VND', min: 3000000, max: 5000000 },
  { id: '5000000-999999999', label: 'Trên 5.000.000 VND', min: 5000000, max: 999999999 },
];

const SearchResultsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

  // Search params
  const location = searchParams.get("location") || "";
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const adults = searchParams.get("adults") || "1";

  // Filter states
  const [filters, setFilters] = useState({
    price_ranges: [], // Array of selected price ranges (e.g., ['0-500000', '500000-1000000'])
    min_reviews: 0,
    star_rating: [], // Array of selected star ratings (e.g., [5, 4])
    popular_filters: {
      free_cancellation: false,
      free_breakfast: false,
      free_wifi: false,
    },
  });

  // Sort state
  const [sortBy, setSortBy] = useState("popularity");

  // Fetch search results
  useEffect(() => {
    const fetchSearchResults = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (location) params.append("location", location);
        if (checkIn) params.append("check_in", checkIn);
        if (checkOut) params.append("check_out", checkOut);
        if (adults) params.append("adults", adults);
        
        // Price range filter - convert checkbox selections to min/max price
        if (filters.price_ranges && filters.price_ranges.length > 0) {
          const allMins = filters.price_ranges.map(rangeId => {
            const range = PRICE_RANGES.find(r => r.id === rangeId);
            return range ? range.min : 0;
          });
          const allMaxs = filters.price_ranges.map(rangeId => {
            const range = PRICE_RANGES.find(r => r.id === rangeId);
            return range ? range.max : 5000000;
          });
          const minPrice = Math.min(...allMins);
          const maxPrice = Math.max(...allMaxs);
          if (minPrice > 0) params.append("min_price", minPrice);
          if (maxPrice < 999999999) params.append("max_price", maxPrice);
        }
        
        if (filters.min_reviews > 0) params.append("min_reviews", filters.min_reviews);
        if (filters.star_rating && filters.star_rating.length > 0) {
          params.append("star_rating", filters.star_rating.join(","));
        }
        params.append("sort_by", sortBy);

        const res = await fetch(`/api/hotels/search?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Không thể tìm kiếm khách sạn");
        }
        const data = await res.json();
        setHotels(data);
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tìm kiếm");
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [location, checkIn, checkOut, adults, filters, sortBy]);

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate - checkInDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights();

  const getRatingStars = (rating) => {
    const ratingNum = parseFloat(rating) || 0;
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${i < Math.round(ratingNum) ? "text-yellow-400" : "text-gray-300"}`}
      ></i>
    ));
  };

  const getRatingLabel = (rating) => {
    const ratingNum = parseFloat(rating) || 0;
    if (ratingNum >= 9) return "Xuất sắc";
    if (ratingNum >= 8) return "Rất tốt";
    if (ratingNum >= 7) return "Tốt";
    if (ratingNum >= 6) return "Khá tốt";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      price_ranges: [],
      min_reviews: 0,
      star_rating: [],
      popular_filters: {
        free_cancellation: false,
        free_breakfast: false,
        free_wifi: false,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Search Bar */}
      <div className="max-w-7xl mx-auto ">
        <SearchRoom
          initialDestination={location}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialAdults={parseInt(adults) || 1}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Location & Count */}
            <div className="flex items-center gap-3">
              {location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <i className="fas fa-map-marker-alt text-amber-700"></i>
                  <span className="font-medium">{location}</span>
                </div>
              )}
              <span className="text-gray-600">
                <span className="font-semibold">{hotels.length}</span> nơi lưu trú được tìm thấy
              </span>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-amber-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="popularity">Độ phổ biến</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-1/4 space-y-3">
            {/* Map Section */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <div className="relative h-40 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-map-marker-alt text-3xl text-amber-700"></i>
                </div>
              </div>
              <button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-1.5 px-3 rounded-lg transition-colors text-sm">
                Explore on Map
              </button>
            </div>

            {/* Reset Filters */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <button
                onClick={resetFilters}
                className="w-full text-sm text-amber-700 hover:underline text-center"
              >
                Đặt lại bộ lọc
              </button>
            </div>

            {/* Price Range Filter */}
            <FilterSection title="Khoảng giá">
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <label key={range.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.price_ranges.includes(range.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters((prev) => ({
                            ...prev,
                            price_ranges: [...prev.price_ranges, range.id],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            price_ranges: prev.price_ranges.filter((r) => r !== range.id),
                          }));
                        }
                      }}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-sm text-gray-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

      
            {/* Star Rating Filter */}
            <FilterSection title="Đánh giá sao">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <label key={stars} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.star_rating.includes(stars)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters((prev) => ({
                            ...prev,
                            star_rating: [...prev.star_rating, stars],
                          }));
                        } else {
                          setFilters((prev) => ({
                            ...prev,
                            star_rating: prev.star_rating.filter((r) => r !== stars),
                          }));
                        }
                      }}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: stars }).map((_, i) => (
                        <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                      ))}
                    </div>
                  </label>
                ))}
              </div>
            </FilterSection>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-12">
                <Loading message="Đang tìm kiếm khách sạn..." color="blue" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {!loading && !error && hotels.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-3xl font-semibold text-gray-700 mb-2">
                  Không tìm thấy khách sạn phù hợp
                </h2>
                <p className="text-gray-500 mb-6 text-lg">
                  Vui lòng thử lại với tiêu chí tìm kiếm khác.
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="bg-amber-700 hover:bg-amber-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Tìm kiếm lại
                </button>
              </div>
            )}

            {!loading && hotels.length > 0 && (
              <div className={viewMode === "grid" ? "grid grid-cols-1 gap-4" : "space-y-4"}>
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    nights={nights}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    adults={adults}
                    viewMode={viewMode}
                    getRatingStars={getRatingStars}
                    getRatingLabel={getRatingLabel}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Filter Section Component
const FilterSection = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-white rounded-lg shadow-sm transition-all ${isOpen ? "p-4" : "p-3"}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between ${isOpen ? "mb-3" : ""}`}
      >
        <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
        <i className={`fas fa-chevron-${isOpen ? "up" : "down"} text-gray-500 text-xs`}></i>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

// Hotel Card Component
const HotelCard = ({
  hotel,
  nights,
  checkIn,
  checkOut,
  adults,
  viewMode,
  getRatingStars,
  getRatingLabel,
  formatPrice,
}) => {
  const mainPhotos = hotel.photos && hotel.photos.length > 0 ? hotel.photos : [];
  const minPrice = hotel.min_price_per_night || 0;
  const totalPrice = nights > 0 ? minPrice * nights : minPrice;
  const discountPrice = totalPrice * 0.92; // Giả sử giảm 8%

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`${viewMode === "grid" ? "md:flex" : "flex"} h-auto`}>
        {/* Images */}
        <div className={`relative ${viewMode === "grid" ? "md:w-2/5" : "w-2/5"} overflow-hidden h-48 md:h-auto`}>
          {mainPhotos.length > 0 ? (
            <Swiper
              modules={[Pagination]}
              pagination={{ 
                clickable: true,
              }}
              className="h-full w-full hotel-image-swiper"
            >
              {mainPhotos.slice(0, 3).map((photo, idx) => (
                <SwiperSlide key={idx} className="!h-full !w-full">
                  <div className="relative h-full w-full min-h-[192px]">
                    <Image
                      src={photo}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 40vw, 40vw"
                      priority={idx === 0}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="relative h-full w-full min-h-[192px] bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-image text-3xl text-gray-400"></i>
              </div>
            </div>
          )}
        </div>

        {/* Hotel Info */}
        <div className={viewMode === "grid" ? "md:w-3/5 p-4" : "w-3/5 p-4"}>
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{hotel.name}</h3>
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <div className="flex items-center gap-1">
                  {getRatingStars(hotel.average_rating)}
                </div>
                <span className="font-semibold text-gray-800 text-sm">
                  {hotel.average_rating}
                </span>
                {hotel.total_reviews > 0 && (
                  <span className="text-gray-600 text-xs">
                    ({hotel.total_reviews > 1000
                      ? `${(hotel.total_reviews / 1000).toFixed(1)}N`
                      : hotel.total_reviews} đánh giá)
                  </span>
                )}
                <span className="text-gray-600">•</span>
                <span className="text-gray-600 text-xs">{getRatingLabel(hotel.average_rating)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 mb-1">
                <i className="fas fa-map-marker-alt text-amber-700 text-xs"></i>
                <span className="text-xs">{hotel.address || hotel.location}</span>
              </div>
              {hotel.available_rooms_count > 0 && (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                    Hạng 1 trong số Khách sạn {Math.round(parseFloat(hotel.average_rating) || 3)} sao
                  </span>
                </div>
              )}
              {checkIn && checkOut && hotel.available_rooms_in_period !== undefined && (
                <div className="text-xs text-green-600 mb-1 flex items-center gap-1">
                  <i className="fas fa-bed text-xs"></i>
                  <span className="font-medium">
                    Còn {hotel.available_rooms_in_period} phòng trống trong khoảng thời gian này
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hotel.available_rooms_count > 0 && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                Nhà bếp mini
              </span>
            )}
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
              Quầy bar
            </span>
          </div>

          {/* Discount Message */}
          <div className="bg-amber-50 text-amber-800 text-xs px-2 py-1 rounded mb-2 flex items-center gap-1.5">
            <i className="fas fa-percentage text-xs"></i>
            <span>Mã giảm đến 200K có sẵn trong ví của bạn!</span>
          </div>

          {/* Price & Booking */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex-1">
              {nights > 0 ? (
                <div>
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(totalPrice)} VND
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatPrice(discountPrice)} VND
                  </div>
                  <div className="text-xs text-gray-600">Cho {nights} đêm</div>
                </div>
              ) : (
                <div>
                  <div className="text-lg font-bold text-gray-800">
                    {formatPrice(minPrice)} VND
                  </div>
                  <div className="text-xs text-gray-600">/ đêm</div>
                </div>
              )}
              <div className="text-xs text-orange-600 mt-0.5 font-medium">
                {hotel.available_rooms_count <= 1
                  ? "Chỉ còn 1 phòng có giá này!"
                  : "Thường kín phòng!"}
              </div>
            </div>
            <Link
              href={`/hotels/${hotel.id}${checkIn && checkOut ? `?check_in=${checkIn}&check_out=${checkOut}&adults=${adults}` : ''}`}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap ml-3 text-sm"
            >
              Chọn phòng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
