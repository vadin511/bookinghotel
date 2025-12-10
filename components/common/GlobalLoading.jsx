"use client";

import { useEffect, useState, useRef } from "react";

const GlobalLoading = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const startTime = useRef(Date.now());
  const MIN_LOADING_TIME = 600; // Tối thiểu 600ms để tránh flash quá nhanh

  useEffect(() => {
    // Kiểm tra khi document đã load xong
    const handleLoad = () => {
      // Đảm bảo loading hiển thị ít nhất MIN_LOADING_TIME
      const elapsed = Date.now() - startTime.current;
      const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
      
      setTimeout(() => {
        setIsLoading(false);
      }, remainingTime + 200); // Thêm 200ms để đảm bảo render xong
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        handleLoad();
      } else {
        window.addEventListener("load", handleLoad);
        // Fallback: nếu load event không fire, ẩn sau 2 giây
        const fallbackTimer = setTimeout(() => {
          setIsLoading(false);
        }, 2000);
        
        return () => {
          window.removeEventListener("load", handleLoad);
          clearTimeout(fallbackTimer);
        };
      }
    }
  }, []);

  const showLoading = isLoading;

  return (
    <>
      {showLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center">
          <div className="text-center">
            {/* Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            
            {/* Logo hoặc text */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-2xl font-bold text-indigo-600">VadiGo</h2>
            </div>
            
            {/* Loading text */}
            <p className="text-gray-600 text-sm animate-pulse">
              Đang tải trang web...
            </p>
          </div>
        </div>
      )}
      <div className={showLoading ? "opacity-0" : "opacity-100 transition-opacity duration-300"}>
        {children}
      </div>
    </>
  );
};

export default GlobalLoading;

