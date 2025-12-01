"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHotels } from "../../../app/store/features/hotelSlice";
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

const HotelsPage = () => {
  const dispatch = useDispatch();
  const { data: hotels, loading, error } = useSelector((state) => state.hotels);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredHotels, setFilteredHotels] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    star_rating: [], // Array of selected star ratings (e.g., [5, 4])
    price_ranges: [], // Array of selected price ranges (e.g., ['0-500000', '500000-1000000'])
  });
  
  // Sort state
  const [sortBy, setSortBy] = useState("popularity"); // popularity, price_asc, price_desc, rating

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  // Filter and sort hotels
  useEffect(() => {
    if (hotels && hotels.length > 0) {
      let filtered = hotels.filter((hotel) => {
        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm || (
          hotel.name?.toLowerCase().includes(searchLower) ||
          hotel.address?.toLowerCase().includes(searchLower) ||
          hotel.description?.toLowerCase().includes(searchLower) ||
          hotel.location?.toLowerCase().includes(searchLower)
        );

        if (!matchesSearch) return false;

        // Star rating filter
        if (filters.star_rating.length > 0) {
          const hotelRating = parseFloat(hotel.average_rating) || 0;
          const matchesStarRating = filters.star_rating.some(star => {
            if (star === 5) return hotelRating >= 4.5;
            if (star === 4) return hotelRating >= 3.5 && hotelRating < 4.5;
            if (star === 3) return hotelRating >= 2.5 && hotelRating < 3.5;
            if (star === 2) return hotelRating >= 1.5 && hotelRating < 2.5;
            if (star === 1) return hotelRating >= 0.5 && hotelRating < 1.5;
            return false;
          });
          if (!matchesStarRating) return false;
        }

        // Price range filter
        if (filters.price_ranges.length > 0 && hotel.min_price_per_night) {
          const matchesPrice = filters.price_ranges.some(rangeId => {
            const range = PRICE_RANGES.find(r => r.id === rangeId);
            if (!range) return false;
            return hotel.min_price_per_night >= range.min && hotel.min_price_per_night <= range.max;
          });
          if (!matchesPrice) return false;
        }

        return true;
      });

      // Sort hotels
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case "price_asc":
            return (a.min_price_per_night || 0) - (b.min_price_per_night || 0);
          case "price_desc":
            return (b.min_price_per_night || 0) - (a.min_price_per_night || 0);
          case "rating":
            return (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0);
          case "popularity":
          default:
            return (b.total_reviews || 0) - (a.total_reviews || 0);
        }
      });

      setFilteredHotels(filtered);
    } else {
      setFilteredHotels([]);
    }
  }, [searchTerm, hotels, filters, sortBy]);

  if (loading && hotels.length === 0) {
    return (
      <Loading
        message="Đang tải danh sách khách sạn..."
        fullScreen={true}
        color="amber"
        className="bg-[#f9f9f9]"
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Lỗi: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      star_rating: [],
      price_ranges: [],
    });
  };

  const displayHotels = filteredHotels;

  return (
    <div className="min-h-screen bg-[#f9f9f9] py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#5a4330]">
              Khám phá các khách sạn tuyệt vời của chúng tôi
            </h1>
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

        {/* Search Bar - Smaller */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Tìm kiếm khách sạn theo tên, địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:w-1/4 space-y-3">
            {/* Reset Filters */}
            <div className="bg-white rounded-lg shadow-sm p-3">
              <button
                onClick={resetFilters}
                className="w-full text-sm text-amber-700 hover:underline text-center"
              >
                Đặt lại bộ lọc
              </button>
            </div>

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
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            {/* Results Count */}
            <div className="mb-4 bg-white rounded-lg shadow-sm p-3">
              <span className="text-gray-600 text-sm">
                Tìm thấy <span className="font-semibold">{displayHotels.length}</span> khách sạn
              </span>
            </div>

            {/* Hotels Grid */}
            {displayHotels.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🏨</div>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  {searchTerm || filters.star_rating.length > 0 || filters.price_ranges.length > 0
                    ? "Không tìm thấy khách sạn"
                    : "Chưa có khách sạn nào"}
                </h2>
                <p className="text-gray-500">
                  {searchTerm || filters.star_rating.length > 0 || filters.price_ranges.length > 0
                    ? "Vui lòng thử lại với tiêu chí khác"
                    : "Hiện tại chưa có khách sạn nào trong hệ thống"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {displayHotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    href={`/hotels/${hotel.id}`}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    {/* Hotel Image */}
                    {hotel.photos && hotel.photos.length > 0 && (
                      <div className="relative w-full h-64">
                        <Image
                          src={hotel.photos[0]}
                          alt={hotel.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                          className="object-cover"
                          priority={false}
                        />
                        {hotel.photos.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                            <i className="fas fa-images mr-1"></i>
                            {hotel.photos.length}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Hotel Info */}
                    <div className="p-6">
                      <h3 className="text-2xl font-semibold text-[#5a4330] mb-2">
                        {hotel.name}
                      </h3>
                      {hotel.address && (
                        <p className="text-gray-600 mb-3 flex items-start">
                          <i className="fas fa-map-marker-alt mr-2 mt-1 text-amber-700"></i>
                          <span>{hotel.address}</span>
                        </p>
                      )}
                      {hotel.description && (
                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                          {hotel.description}
                        </p>
                      )}
                      {/* Rating and Reviews */}
                      {(hotel.average_rating > 0 || hotel.total_reviews > 0) && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <i
                                key={i}
                                className={`fas fa-star text-xs ${
                                  i < Math.round(parseFloat(hotel.average_rating) || 0)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              ></i>
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            {parseFloat(hotel.average_rating || 0).toFixed(1)}
                          </span>
                          {hotel.total_reviews > 0 && (
                            <span className="text-sm text-gray-600">
                              ({hotel.total_reviews} đánh giá)
                            </span>
                          )}
                        </div>
                      )}
                      {/* Price */}
                      {hotel.min_price_per_night && (
                        <div className="mb-3">
                          <span className="text-lg font-bold text-amber-700">
                            {formatPrice(hotel.min_price_per_night)} VND
                          </span>
                          <span className="text-sm text-gray-600 ml-1">/ đêm</span>
                        </div>
                      )}
                      {hotel.phone && (
                        <p className="text-gray-600 text-sm mb-2">
                          <i className="fas fa-phone mr-2"></i>
                          {hotel.phone}
                        </p>
                      )}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                          <span>Xem chi tiết</span>
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  </Link>
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

export default HotelsPage;

