"use client";

import { useEffect, useState } from "react";

const ProvinceSelector = ({ value, onChange, placeholder = "Chọn tỉnh/thành phố", className = "" }) => {
  const [provinces, setProvinces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://provinces.open-api.vn/api/v2/p/");
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành phố");
        }
        
        const data = await response.json();
        // Sắp xếp theo tên
        const sortedData = data.sort((a, b) => 
          a.name.localeCompare(b.name, 'vi')
        );
        setProvinces(sortedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching provinces:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleChange = (e) => {
    const selectedValue = e.target.value;
    onChange(selectedValue);
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <select
          disabled
          className="w-full p-2 border border-gray-300 rounded bg-gray-100"
        >
          <option>Đang tải...</option>
        </select>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <select
          className="w-full p-2 border border-red-300 rounded bg-red-50"
          value={value || ""}
          onChange={handleChange}
        >
          <option value="">Lỗi tải dữ liệu</option>
        </select>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-700 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {provinces.map((province) => (
        <option key={province.code} value={province.name}>
          {province.name}
        </option>
      ))}
    </select>
  );
};

export default ProvinceSelector;

