"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addHotel,
  deleteHotel,
  fetchHotels,
  updateHotel,
} from "../../../store/features/hotelSlice";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import ActionDropdown from "@/components/common/ActionDropdown";

const HotelManagement = () => {
  const dispatch = useDispatch();
  const { data: hotels, loading, error } = useSelector((state) => state.hotels);

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    address: "",
    description: "",
    location: "",
    map_url: "",
    phone: "",
    email: "",
    photos: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const upload = async (e) => {
    const files = e.target.files;
    const data = new FormData();

    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]);
    }

    try {
      const res = await axios.post("http://localhost:3000/api/upload", data);
      const { files: uploadedFilenames } = res.data;

      const newPhotoPaths = uploadedFilenames.map((file) => `/uploads/${file}`);

      setAddedPhotos((prev) => [...prev, ...newPhotoPaths]);
      setFormData((prev) => ({
        ...prev,
        photos: [
          ...prev.photos.split(",").filter(Boolean),
          ...newPhotoPaths,
        ].join(","),
      }));
    } catch (err) {
      toast.error("Không thể upload ảnh. Vui lòng thử lại.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Xử lý map_url: extract URL từ iframe HTML nếu có, hoặc giữ nguyên URL
    let processedMapUrl = formData.map_url?.trim() || null;
    
    if (processedMapUrl) {
      // Nếu là thẻ iframe HTML, extract URL từ src attribute
      if (processedMapUrl.includes("<iframe") || processedMapUrl.includes("iframe")) {
        // Thử nhiều cách extract
        let extractedUrl = null;
        
        // Cách 1: src="..." hoặc src='...'
        const srcMatch1 = processedMapUrl.match(/src\s*=\s*["']([^"']+)["']/i);
        if (srcMatch1 && srcMatch1[1]) {
          extractedUrl = srcMatch1[1];
        }
        
        // Cách 2: src=... (không có quotes)
        if (!extractedUrl) {
          const srcMatch2 = processedMapUrl.match(/src\s*=\s*([^\s>]+)/i);
          if (srcMatch2 && srcMatch2[1]) {
            extractedUrl = srcMatch2[1].replace(/["']/g, "");
          }
        }
        
        // Cách 3: Tìm URL Google Maps trực tiếp trong chuỗi
        if (!extractedUrl) {
          const urlMatch = processedMapUrl.match(/https?:\/\/[^\s"'>]+/i);
          if (urlMatch && urlMatch[0]) {
            extractedUrl = urlMatch[0];
          }
        }
        
        if (extractedUrl) {
          processedMapUrl = extractedUrl.trim();
          console.log("Extracted URL from iframe:", processedMapUrl);
        } else {
          console.warn("Could not extract URL from iframe, using original");
        }
      }
      
      // Kiểm tra độ dài URL (giới hạn 500 ký tự để tránh lỗi database)
      if (processedMapUrl && processedMapUrl.length > 500) {
        toast.warning("URL bản đồ quá dài. Vui lòng chỉ nhập URL embed (không bao gồm thẻ iframe HTML).");
        return;
      }
    }
    
    const hotelData = {
      ...formData,
      location: formData.location?.trim() || null,
      map_url: processedMapUrl,
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      photos: formData.photos ? formData.photos.split(",").map((url) => url.trim()).filter(Boolean) : [],
    };

    // Debug: log để kiểm tra dữ liệu
    console.log("Submitting hotel data:", {
      ...hotelData,
      map_url_length: hotelData.map_url?.length || 0
    });

    if (isEditing) {
      dispatch(updateHotel({ id: formData.id, data: hotelData })).then((result) => {
        if (updateHotel.fulfilled.match(result)) {
          toast.success(`Cập nhật khách sạn "${hotelData.name}" thành công!`);
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Cập nhật khách sạn thất bại!");
          console.error("Update failed:", result.payload);
        }
      }).catch((error) => {
        toast.error("Có lỗi xảy ra khi cập nhật khách sạn!");
        console.error("Update error:", error);
      });
    } else {
      dispatch(addHotel(hotelData)).then((result) => {
        if (addHotel.fulfilled.match(result)) {
          toast.success(`Thêm khách sạn "${hotelData.name}" thành công!`);
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Thêm khách sạn thất bại!");
        }
      }).catch((error) => {
        toast.error("Có lỗi xảy ra khi thêm khách sạn!");
      });
    }
  };

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  // Filter hotels by name
  const filteredHotels = hotels.filter((hotel) =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch danh sách tỉnh/thành phố từ API
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const response = await fetch("https://provinces.open-api.vn/api/v1/p/");
        
        if (!response.ok) {
          throw new Error("Không thể tải danh sách tỉnh/thành phố");
        }
        
        const data = await response.json();
        // Sắp xếp theo tên
        const sortedData = data.sort((a, b) => 
          a.name.localeCompare(b.name, 'vi')
        );
        setProvinces(sortedData);
      } catch (err) {
        console.error("Error fetching provinces:", err);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
      } finally {
        setLoadingProvinces(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleEdit = (hotel) => {
    setFormData({
      ...hotel,
      photos: Array.isArray(hotel.photos) ? hotel.photos.join(", ") : (hotel.photos || ""),
      location: hotel.location || "",
      map_url: hotel.map_url || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const hotel = hotels.find(h => h.id === id);
    const hotelName = hotel ? hotel.name : "khách sạn này";
    
    setConfirmDialog({
      isOpen: true,
      title: "Xóa khách sạn",
      message: `Bạn có chắc chắn muốn xóa khách sạn "${hotelName}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      type: "danger",
      onConfirm: () => {
        dispatch(deleteHotel(id)).then((result) => {
          if (deleteHotel.fulfilled.match(result)) {
            toast.success(`Xóa khách sạn "${hotelName}" thành công!`);
          } else {
            toast.error(result.payload || `Xóa khách sạn "${hotelName}" thất bại!`);
          }
        }).catch((error) => {
          toast.error("Có lỗi xảy ra khi xóa khách sạn!");
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      address: "",
      description: "",
      location: "",
      map_url: "",
      phone: "",
      email: "",
      photos: "",
    });
    setAddedPhotos([]);
  };

  const openDetailModal = (hotel) => {
    setSelectedHotel(hotel);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Quản lý Khách sạn</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-base">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            resetForm();
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm Khách sạn</span>
        </button>
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách sạn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            />
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => {
            setIsModalOpen(false);
            setIsEditing(false);
            resetForm();
          }}
        >
          <div 
            className="bg-white p-6 rounded shadow-md w-full max-w-xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-4">
              {isEditing ? "Cập nhật Khách sạn" : "Thêm Khách sạn Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Tên khách sạn"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="address"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                name="description"
                placeholder="Mô tả"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div>
                <label className="block mb-1 font-medium text-base">
                  Tỉnh/Thành phố <span className="text-gray-500">(tùy chọn)</span>:
                </label>
                <select
                  name="location"
                  value={formData.location || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-700 focus:border-transparent"
                  disabled={loadingProvinces}
                >
                  <option value="">{loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}</option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                name="map_url"
                placeholder="URL bản đồ (map_url) - Có thể nhập URL hoặc thẻ iframe HTML đầy đủ"
                value={formData.map_url}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded resize-y"
              />
              <input
                type="text"
                name="phone"
                placeholder="Số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />

              {/* Upload ảnh */}
              <div>
                <label className="block mb-1 font-medium text-base">Upload ảnh:</label>
                <input
                  type="file"
                  multiple
                  onChange={upload}
                  className="mb-2"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.photos &&
                    formData.photos
                      .split(",")
                      .filter(Boolean)
                      .map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo.trim()}
                            alt="Ảnh khách sạn"
                            className="w-20 h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const photosArray = formData.photos.split(",").filter(Boolean);
                              photosArray.splice(idx, 1);
                              setFormData((prev) => ({
                                ...prev,
                                photos: photosArray.join(","),
                              }));
                              setAddedPhotos((prev) => prev.filter((p) => p !== photo.trim()));
                              toast.success("Đã xóa ảnh!");
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                            title="Xóa ảnh"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-base font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <i className="fas fa-times"></i>
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-lg hover:shadow-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isEditing
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                      : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  }`}
                >
                  <i className={isEditing ? "fas fa-save" : "fas fa-plus-circle"}></i>
                  <span>{isEditing ? "Cập nhật" : "Thêm"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bảng danh sách khách sạn */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Tên</th>
              <th className="border px-4 py-2">Địa chỉ</th>
              <th className="border px-4 py-2">Mô tả</th>
              <th className="border px-4 py-2">Vị trí</th>
              <th className="border px-4 py-2">Số điện thoại</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <Loading message="Đang tải danh sách khách sạn..." color="indigo" size="sm" />
                </td>
              </tr>
            ) : filteredHotels.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  {searchTerm ? `Không tìm thấy khách sạn nào với từ khóa "${searchTerm}"` : "Không có khách sạn nào."}
                </td>
              </tr>
            ) : (
              filteredHotels.map((hotel, key ) => (
                <tr key={key}>
                  <td className="border px-4 py-2">{hotel.id}</td>
                  <td className="border px-4 py-2">{hotel.name}</td>
                  <td className="border px-4 py-2">{hotel.address || "N/A"}</td>
                  <td className="border px-4 py-2 max-w-xs">
                    <div className="line-clamp-2 text-sm">
                      {hotel.description || "N/A"}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="max-w-xs truncate text-sm">
                      {hotel.location || "N/A"}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{hotel.phone || "N/A"}</td>
                  <td className="border px-4 py-2">
                    <div className="max-w-xs truncate text-sm">
                      {hotel.email || "N/A"}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(hotel.photos) && hotel.photos.length > 0 ? (
                        <>
                          {hotel.photos
                            .slice(0, 2)
                            .map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`hotel-${hotel.id}-${idx}`}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ))}
                          {hotel.photos.length > 2 && (
                            <span className="text-sm text-gray-500 ml-1">
                              +{hotel.photos.length - 2}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Không có ảnh</span>
                      )}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(hotel),
                        },
                        {
                          divider: true,
                        },
                        {
                          label: "Sửa",
                          icon: "fas fa-edit",
                          onClick: () => handleEdit(hotel),
                        },
                        {
                          label: "Xóa",
                          icon: "fas fa-trash-alt",
                          onClick: () => handleDelete(hotel.id),
                          danger: true,
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedHotel && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-700 to-green-800 text-white p-6 rounded-t-2xl z-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedHotel.name}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-2"></i>
                      {selectedHotel.address || "Chưa có địa chỉ"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-green-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Photos */}
              {selectedHotel.photos && Array.isArray(selectedHotel.photos) && selectedHotel.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-images mr-2 text-green-700"></i>
                    Hình ảnh khách sạn
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedHotel.photos.map((photo, idx) => (
                      <div key={idx} className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={photo}
                          alt={`${selectedHotel.name} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedHotel.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-align-left mr-2 text-green-700"></i>
                    Mô tả
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedHotel.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Hotel Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-green-700"></i>
                  Thông tin khách sạn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedHotel.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tên khách sạn</p>
                    <p className="font-medium text-gray-900">{selectedHotel.name}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                    <p className="font-medium text-gray-900">{selectedHotel.address || "N/A"}</p>
                  </div>
                  {selectedHotel.location && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Tỉnh/Thành phố</p>
                      <p className="font-medium text-gray-900">{selectedHotel.location}</p>
                    </div>
                  )}
                  {selectedHotel.phone && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{selectedHotel.phone}</p>
                    </div>
                  )}
                  {selectedHotel.email && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${selectedHotel.email}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {selectedHotel.email}
                      </a>
                    </div>
                  )}
                  {selectedHotel.map_url && (
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Bản đồ</p>
                      <a
                        href={selectedHotel.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 break-all"
                      >
                        Xem bản đồ
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedHotel);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Sửa khách sạn</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDelete(selectedHotel.id);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa khách sạn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm || (() => {})}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default HotelManagement;