"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const SearchRoom = ({ initialDestination = "", initialCheckIn = "", initialCheckOut = "", initialAdults = 1 }) => {
  const router = useRouter();
  const [destination, setDestination] = useState(initialDestination);
  const [adults, setAdults] = useState(initialAdults);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [hotels, setHotels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [provinces, setProvinces] = useState([]); // Danh sách tỉnh/thành phố từ API
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1); // State cho keyboard navigation
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateError, setDateError] = useState("");
  const datePickerRef = useRef(null);
  const destinationRef = useRef(null);
  const suggestionItemsRef = useRef([]); // Ref cho các item suggestions
  const checkInRef = useRef();
  const checkOutRef = useRef();

  // Sync với props khi thay đổi
  useEffect(() => {
    setDestination(initialDestination);
    setCheckIn(initialCheckIn);
    setCheckOut(initialCheckOut);
    setAdults(initialAdults);
  }, [initialDestination, initialCheckIn, initialCheckOut, initialAdults]);

  // Lấy danh sách tỉnh/thành phố từ API - GỌI NGAY KHI MOUNT
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/v1/p/");
        
        if (!res.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành phố");
        }
        
        const data = await res.json();
        // Sắp xếp theo tên
        const sortedProvinces = data.sort((a, b) => 
          a.name.localeCompare(b.name, 'vi')
        );
        
        // Lấy danh sách tên tỉnh/thành phố
        const provinceNames = sortedProvinces.map(p => p.name);
        setProvinces(provinceNames);
        setLocations(provinceNames); // Sử dụng danh sách từ API làm locations
        console.log("Provinces loaded:", provinceNames.length); // Debug
      } catch (error) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", error);
        // Fallback: lấy từ hotels nếu API lỗi
        fetchHotelsFallback();
      }
    };

    // Fallback: lấy locations từ hotels nếu API tỉnh/thành phố không khả dụng
    const fetchHotelsFallback = async () => {
      try {
        const res = await fetch("/api/hotel");
        const data = await res.json();
        
        if (res.ok && Array.isArray(data)) {
          setHotels(data);
          const uniqueLocations = new Set();
          data.forEach((hotel) => {
            if (hotel.location) {
              uniqueLocations.add(hotel.location);
            }
          });
          const sortedLocations = Array.from(uniqueLocations).sort((a, b) => 
            a.localeCompare(b, 'vi')
          );
          setLocations(sortedLocations);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách hotels:", error);
        setLocations([]);
      }
    };
    
    fetchProvinces(); // GỌI NGAY, KHÔNG CẦN ĐỢI
  }, []); // Chỉ chạy 1 lần khi mount

  // Filter suggestions khi người dùng nhập
  useEffect(() => {
    if (locations.length > 0) {
      if (destination) {
        // Có từ khóa tìm kiếm - filter theo từ khóa
        const searchTerm = destination.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const filtered = locations
          .filter((loc) => {
            const normalizedLoc = loc.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedLoc.includes(searchTerm);
          })
          .sort((a, b) => {
            // Ưu tiên các kết quả bắt đầu với search term
            const aStarts = a.toLowerCase().startsWith(destination.toLowerCase());
            const bStarts = b.toLowerCase().startsWith(destination.toLowerCase());
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
          });
        setFilteredSuggestions(filtered.slice(0, 8));
        setShowSuggestions(filtered.length > 0);
        console.log("Filtered suggestions:", filtered.length); // Debug
      } else {
        // Không có từ khóa - hiển thị tất cả (giới hạn 8 items đầu tiên)
        setFilteredSuggestions(locations.slice(0, 8));
        // Chỉ hiển thị nếu đang focus vào input
        // setShowSuggestions sẽ được điều khiển bởi onFocus
        console.log("All suggestions:", locations.slice(0, 8).length); // Debug
      }
      setSelectedIndex(-1); // Reset selected index khi filter thay đổi
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [destination, locations]);

  // Xử lý keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (showSuggestions && filteredSuggestions.length > 0) {
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          // Có suggestion được chọn - chọn nó
          e.preventDefault();
          handleSelectSuggestion(filteredSuggestions[selectedIndex]);
        } else {
          // Không có suggestion nào được chọn - đóng suggestions và cho phép submit form
          setShowSuggestions(false);
          setSelectedIndex(-1);
          // Không preventDefault để form có thể submit
        }
      }
      // Nếu không có suggestions, cho phép form submit tự nhiên
      return;
    }

    if (!showSuggestions || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll vào view khi selectedIndex thay đổi
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionItemsRef.current[selectedIndex]) {
      suggestionItemsRef.current[selectedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Chọn suggestion
  const handleSelectSuggestion = (location) => {
    setDestination(location);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Đóng date picker và suggestions khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
      if (
        destinationRef.current &&
        !destinationRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (showDatePicker || showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker, showSuggestions]);

  // Validation ngày tháng
  useEffect(() => {
    if (checkIn && checkOut) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate < today) {
        setDateError("Ngày check-in không được là quá khứ");
      } else if (checkOutDate <= checkInDate) {
        setDateError("Ngày check-out phải sau ngày check-in");
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }
  }, [checkIn, checkOut]);

  // Format ngày tháng để hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Validation: chỉ kiểm tra nếu đã nhập ngày thì phải hợp lệ
    if (checkIn || checkOut) {
      if (!checkIn || !checkOut) {
        toast.warning("Vui lòng chọn đầy đủ ngày check-in và check-out");
        return;
      }
      
      if (dateError) {
        toast.error(dateError);
        return;
      }
    }

    // Tạo query params
    const params = new URLSearchParams();
    if (destination) params.append("location", destination);
    if (checkIn) params.append("check_in", checkIn);
    if (checkOut) params.append("check_out", checkOut);
    if (adults) params.append("adults", adults.toString());

    // Redirect đến trang kết quả tìm kiếm
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-[#472E1E] rounded-2xl md:rounded-full flex flex-col md:flex-row items-stretch md:items-center justify-evenly p-3 sm:p-4 md:p-4 gap-3 md:gap-4 w-full max-w-6xl mx-auto shadow-lg"
    >
      {/* Destination Input with Autocomplete */}
      <div className="relative flex-1 md:flex-initial min-w-0" ref={destinationRef}>
        <div className="relative flex items-center justify-center border border-gray-300 rounded-full pl-10 sm:pl-12 md:pl-12 pr-8 sm:pr-10 md:pr-10 text-sm sm:text-base md:text-xl text-[#5a3f26] bg-white h-12 md:h-auto px-4 sm:px-6 md:px-8 py-2 md:py-2">
          <div className="absolute left-3 sm:left-4 md:left-4 pointer-events-none">
            <i className="fas fa-map-marker-alt text-xs sm:text-sm md:text-lg"></i>
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              // Hiển thị suggestions khi bắt đầu nhập
              if (locations.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Hiển thị suggestions khi focus vào input
              if (locations.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder="Nhập địa điểm..."
            className="focus:outline-none rounded-full bg-transparent py-2 w-full text-sm sm:text-base md:text-lg pr-2 placeholder-gray-400"
          />
        </div>
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-[#F1F1F1] border border-gray-300 rounded-lg shadow-lg z-[9999] max-h-60 overflow-y-auto"
            style={{ position: 'absolute', zIndex: 9999 }}
          >
            {filteredSuggestions.map((location, index) => (
              <button
                key={index}
                ref={(el) => {
                  if (el) {
                    suggestionItemsRef.current[index] = el;
                  }
                }}
                type="button"
                onClick={() => handleSelectSuggestion(location)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-2 transition-colors text-base md:text-lg text-[#5a3f26] flex items-center ${
                  selectedIndex === index 
                    ? 'bg-amber-100 border-l-4 border-amber-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-map-marker-alt text-amber-700 mr-2 flex-shrink-0"></i>
                <span className="flex-1">{location}</span>
              </button>
            ))}
          </div>
        )}
        
       
      </div>

      {/* Date Range Select */}
      <div className="relative flex-1 md:flex-initial min-w-0" ref={datePickerRef}>
        <button
          type="button"
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="relative w-full flex items-center justify-center gap-2 border border-gray-300 rounded-full text-[#5a3f26] text-sm sm:text-base md:text-lg lg:text-2xl cursor-pointer h-12 md:h-auto pl-8 sm:pl-10 md:pl-12 pr-6 sm:pr-8 md:pr-10 py-2 md:py-4 bg-[#F1F1F1] hover:bg-gray-50 transition-colors"
        >
          <i className="far fa-calendar-alt absolute left-3 sm:left-4 md:left-5 text-xs sm:text-sm md:text-base"></i>
          <div className="flex items-center gap-1 text-xs sm:text-sm md:text-base lg:text-lg whitespace-nowrap overflow-hidden">
            {checkIn && checkOut ? (
              <>
                <span className="truncate">{formatDate(checkIn)}</span>
                <span className="text-gray-400 flex-shrink-0">→</span>
                <span className="truncate">{formatDate(checkOut)}</span>
              </>
            ) : (
              <>
                <span className="truncate">Nhận phòng</span>
                <span className="text-gray-400 flex-shrink-0">→</span>
                <span className="truncate">Trả phòng</span>
              </>
            )}
          </div>
        </button>

        {/* Date Picker Dropdown */}
        {showDatePicker && (
          <div className="absolute top-full left-0 right-0 md:right-auto mt-2 bg-[#F1F1F1] border border-gray-300 rounded-lg shadow-lg p-4 z-50 w-full md:min-w-[300px]">
            <div className="space-y-3">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Nhận phòng:
                </label>
                <input
                  type="date"
                  value={checkIn}
                  ref={checkInRef}
                  onChange={(e) => setCheckIn(e.target.value)}
                  onFocus={() => checkInRef.current.showPicker()}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">
                  Trả phòng:
                </label>
                <input
                  type="date"
                  ref={checkOutRef}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || new Date().toISOString().split("T")[0]}
                  onFocus={() => checkOutRef.current.showPicker()}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-700"
                />
              </div>
              {dateError && (
                <p className="text-red-600 text-base">{dateError}</p>
              )}
              <button
                type="button"
                onClick={() => setShowDatePicker(false)}
                className="w-full bg-amber-700 text-white py-2 rounded-lg hover:bg-amber-800 transition-colors"
              >
                Xác nhận
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adults Count */}
      <div className="relative flex-1 md:flex-initial min-w-0">
        <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-5 border border-gray-300 rounded-full text-[#5a3f26] text-sm sm:text-base md:text-lg lg:text-2xl h-12 md:h-auto pl-8 sm:pl-10 md:pl-12 pr-6 sm:pr-8 md:pr-10 py-2 md:py-4 bg-[#F1F1F1]">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base lg:text-lg">
            <i className="fas fa-user-friends text-xs sm:text-sm"></i>
            <span className="hidden sm:inline">Người lớn:</span>
            <span className="sm:hidden">Người:</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setAdults(Math.max(1, adults - 1))}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm flex items-center justify-center transition-colors flex-shrink-0"
            >
              –
            </button>
            <span className="min-w-[20px] text-center text-xs sm:text-sm md:text-base lg:text-lg font-medium">{adults}</span>
            <button
              type="button"
              onClick={() => setAdults(adults + 1)}
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-xs sm:text-sm flex items-center justify-center transition-colors flex-shrink-0"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="bg-[#5a3f26] text-white rounded-full text-sm sm:text-base md:text-lg lg:text-2xl cursor-pointer w-full md:w-auto h-12 md:h-auto px-4 sm:px-6 md:px-8 py-2 md:py-4 hover:bg-[#4a3320] transition-colors flex-shrink-0 flex items-center justify-center"
      >
        <span className="hidden sm:inline">Tìm kiếm</span>
        <span className="sm:hidden">Tìm</span>
      </button>
    </form>
  );
};

export default SearchRoom;
