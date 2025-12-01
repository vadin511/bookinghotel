"use client";

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../../../store/features/roomSlice";
import { fetchHotels, selectHotels } from "../../../store/features/hotelSlice";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import ActionDropdown from "@/components/common/ActionDropdown";

const RoomManagement = () => {
  const dispatch = useDispatch();
  const { list: rooms, loading, error } = useSelector((state) => state.rooms);
  const hotels = useSelector(selectHotels);

  // State cho danh sách loại phòng từ database
  const [roomTypesFromDB, setRoomTypesFromDB] = useState([]);

  // Mapping các loại phòng (fallback nếu chưa load được từ DB)
  const roomTypes = roomTypesFromDB.length > 0 
    ? roomTypesFromDB.map(rt => ({ value: rt.id.toString(), label: rt.name }))
    : [
        { value: "tiêu chuẩn", label: "Tiêu chuẩn" },
        { value: "thượng đẳng", label: "Thượng đẳng" },
        { value: "sang trọng", label: "Sang trọng" },
        { value: "cao cấp", label: "Cao cấp" },
      ];

  // Mapping các loại giường
  const bedTypes = [
    { value: "Đơn", label: "Đơn" },
    { value: "Đôi", label: "Đôi" },
    { value: "2 đơn", label: "2 đơn" },
  ];

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [priceInputFocused, setPriceInputFocused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // State cho tìm kiếm và lọc
  const [searchHotelName, setSearchHotelName] = useState("");
  const [filterRoomType, setFilterRoomType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [formData, setFormData] = useState({
    id: null,
    hotel_id: "",
    name: "",
    description: "",
    room_type_id: "",
    max_people: "",
    photos: "",
    area_sqm: "",
    bed_type: "",
    price_per_night: "",
    status: "available",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const upload = async (e) => {
    const files = e.target.files;
    const data = new FormData();

    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]); // phải khớp với key bên BE
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
    const roomData = {
      ...formData,
      hotel_id: parseInt(formData.hotel_id),
      room_type_id: formData.room_type_id || null, // Giữ nguyên giá trị string hoặc null
      max_people: formData.max_people ? parseInt(formData.max_people) : null,
      area_sqm: formData.area_sqm ? parseFloat(formData.area_sqm) : null,
      price_per_night: formData.price_per_night ? Math.round(parseFloat(formData.price_per_night.replace(/,/g, ""))) : null,
      photos: formData.photos ? formData.photos.split(",").map((url) => url.trim()).filter(Boolean) : [],
    };

    if (isEditing) {
      dispatch(updateRoom(roomData)).then((result) => {
        if (updateRoom.fulfilled.match(result)) {
          toast.success(`Cập nhật phòng "${roomData.name}" thành công!`);
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Cập nhật phòng thất bại!");
        }
      }).catch((error) => {
        toast.error("Có lỗi xảy ra khi cập nhật phòng!");
      });
    } else {
      dispatch(addRoom(roomData)).then((result) => {
        if (addRoom.fulfilled.match(result)) {
          toast.success(`Thêm phòng "${roomData.name}" thành công!`);
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Thêm phòng thất bại!");
        }
      }).catch((error) => {
        toast.error("Có lỗi xảy ra khi thêm phòng!");
      });
    }
  };

  useEffect(() => {
    dispatch(fetchRooms());
    dispatch(fetchHotels());
    
    // Fetch room types từ database
    const fetchRoomTypes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/room-types");
        if (res.data && Array.isArray(res.data)) {
          setRoomTypesFromDB(res.data);
        }
      } catch (err) {
        console.error("Error fetching room types:", err);
      }
    };
    fetchRoomTypes();
  }, [dispatch]);


  const handleEdit = (room) => {
    // Xử lý photos: nếu là array thì join, nếu là string thì giữ nguyên
    let photosString = "";
    if (Array.isArray(room.photos) && room.photos.length > 0) {
      photosString = room.photos.join(", ");
    } else if (typeof room.photos === "string" && room.photos) {
      photosString = room.photos;
    }

    setFormData({
      ...room,
      photos: photosString,
      max_people: room.max_people?.toString() || "",
      room_type_id: room.room_type_id?.toString() || "",
      hotel_id: room.hotel_id?.toString() || "", // Giữ nguyên hotel_id cũ khi edit
      area_sqm: room.area_sqm?.toString() || "",
      price_per_night: room.price_per_night?.toString() || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const room = rooms.find(r => r.id === id);
    const roomName = room ? room.name : "phòng này";

    setConfirmDialog({
      isOpen: true,
      title: "Xóa phòng",
      message: `Bạn có chắc chắn muốn xóa phòng "${roomName}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      type: "danger",
      onConfirm: () => {
        dispatch(deleteRoom(id)).then((result) => {
          if (deleteRoom.fulfilled.match(result)) {
            toast.success(`Xóa phòng "${roomName}" thành công!`);
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          } else {
            toast.error(result.payload || `Xóa phòng "${roomName}" thất bại!`);
          }
        }).catch((error) => {
          toast.error("Có lỗi xảy ra khi xóa phòng!");
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      hotel_id: "",
      name: "",
      description: "",
      room_type_id: "",
      max_people: "",
      photos: "",
      area_sqm: "",
      bed_type: "",
      price_per_night: "",
      status: "available",
    });
    setAddedPhotos([]);
    setPriceInputFocused(false);
  };

  // Hàm dịch trạng thái sang tiếng Việt
  const getStatusLabel = (status) => {
    const statusMap = {
      available: "Có sẵn",
      maintenance: "Bảo trì",
    };
    return statusMap[status] || status;
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "";
    // Loại bỏ dấu phẩy nếu có và parse thành số
    const numValue = typeof value === 'string' 
      ? parseFloat(value.replace(/,/g, '')) 
      : parseFloat(value);
    if (isNaN(numValue)) return "";
    // Làm tròn về số nguyên và format với dấu phẩy
    const intValue = Math.round(numValue);
    return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const unformatNumber = (value) => {
    if (!value) return "";
    // Loại bỏ dấu phẩy và phần thập phân
    return value.replace(/,/g, "").replace(/\.\d+$/, "");
  };
  
  // Hàm lấy tên khách sạn từ hotel_id
  const getHotelName = (hotelId) => {
    const hotel = hotels.find(h => h.id === hotelId);
    return hotel ? hotel.name : "";
  };

  // Hàm lấy tên loại phòng từ room_type_id
  const getRoomTypeName = (roomTypeId) => {
    if (!roomTypeId) return "N/A";
    const roomType = roomTypesFromDB.find(rt => rt.id === roomTypeId);
    if (roomType) return roomType.name;
    // Fallback: tìm trong mảng roomTypes cũ
    const fallbackType = roomTypes.find(t => t.value === roomTypeId.toString());
    return fallbackType ? fallbackType.label : roomTypeId;
  };

  const openDetailModal = (room) => {
    setSelectedRoom(room);
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

  // Lọc danh sách phòng
  const filteredRooms = rooms.filter((room) => {
    // Lọc theo tên khách sạn
    if (searchHotelName) {
      const hotelName = getHotelName(room.hotel_id);
      if (!hotelName.toLowerCase().includes(searchHotelName.toLowerCase())) {
        return false;
      }
    }

    // Lọc theo loại phòng
    if (filterRoomType) {
      // So sánh room_type_id (có thể là số hoặc null) với filterRoomType (string ID)
      const roomTypeId = room.room_type_id;
      // Nếu room không có room_type_id và filter không phải là "không có loại" thì loại bỏ
      if (!roomTypeId && filterRoomType !== "") {
        return false;
      }
      // So sánh room_type_id với filterRoomType (cả hai đều là string)
      const roomTypeIdStr = roomTypeId ? roomTypeId.toString() : "";
      if (roomTypeIdStr !== filterRoomType) {
        return false;
      }
    }

    // Lọc theo trạng thái
    if (filterStatus) {
      if (room.status !== filterStatus) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Quản lý Phòng</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-base">
          {error}
        </div>
      )}

      {/* Thanh tìm kiếm và lọc */}
      <div className="mb-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Nút Thêm Phòng */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setIsModalOpen(true);
                setIsEditing(false);
                resetForm();
              }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-plus-circle"></i>
              <span>Thêm Phòng</span>
            </button>
          </div>
            {/* Tìm kiếm theo tên khách sạn */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <i className="fas fa-search mr-2"></i>
                Tìm theo tên khách sạn
              </label>
              <input
                type="text"
                placeholder="Nhập tên khách sạn..."
                value={searchHotelName}
                onChange={(e) => setSearchHotelName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Lọc theo loại phòng */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <i className="fas fa-filter mr-2"></i>
                Loại phòng
              </label>
              <select
                value={filterRoomType}
                onChange={(e) => setFilterRoomType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                {roomTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Lọc theo trạng thái */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                <i className="fas fa-info-circle mr-2"></i>
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="available">Có sẵn</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>

          {/* Nút xóa bộ lọc */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchHotelName("");
                setFilterRoomType("");
                setFilterStatus("");
              }}
              className="w-full p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <i className="fas fa-times"></i>
              <span>Xóa bộ lọc</span>
            </button>
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
            className="bg-white p-6 rounded shadow-md w-full max-w-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-4">
              {isEditing ? "Cập nhật Phòng" : "Thêm Phòng Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Hotel Select */}
              <div>
                <label className="block mb-1 font-medium text-base">Khách sạn:</label>
                <select
                  name="hotel_id"
                  value={formData.hotel_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">-- Chọn khách sạn --</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id.toString()}>
                      {hotel.name}{hotel.address ? ` - ${hotel.address}` : ''} (ID: {hotel.id})
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                name="name"
                placeholder="Tên phòng"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {/* Loại phòng */}
              <div>
                <label className="block mb-1 font-medium text-base">Loại phòng:</label>
                <select
                  name="room_type_id"
                  value={formData.room_type_id}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {roomTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                name="max_people"
                placeholder="Số người tối đa"
                value={formData.max_people}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                step="0.1"
                name="area_sqm"
                placeholder="Diện tích (m²)"
                value={formData.area_sqm}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {/* Loại giường */}
              <div>
                <label className="block mb-1 font-medium text-base">Loại giường:</label>
                <select
                  name="bed_type"
                  value={formData.bed_type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">-- Chọn loại giường --</option>
                  {bedTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                name="price_per_night"
                placeholder="Giá mỗi đêm (ví dụ: 1,000,000)"
                value={
                  priceInputFocused 
                    ? formData.price_per_night || ""
                    : (formData.price_per_night ? formatNumber(formData.price_per_night) : "")
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  // Loại bỏ tất cả ký tự không phải số và dấu phẩy
                  const cleaned = inputValue.replace(/[^\d,]/g, "");
                  // Loại bỏ dấu phẩy để lấy số thuần
                  const raw = cleaned.replace(/,/g, "");
                  // Chỉ cho phép số
                  if (raw && !/^\d+$/.test(raw)) return;
                  setFormData({ ...formData, price_per_night: raw || "" });
                }}
                onFocus={() => {
                  setPriceInputFocused(true);
                }}
                onBlur={(e) => {
                  setPriceInputFocused(false);
                  // Khi blur, format lại giá trị
                  const raw = unformatNumber(e.target.value);
                  if (raw) {
                    setFormData({ ...formData, price_per_night: raw });
                  }
                }}
                required
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
                            alt="Ảnh phòng"
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

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="available">Có sẵn</option>
                <option value="maintenance">Bảo trì</option>
              </select>

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
                  className={`px-4 py-2 text-white rounded-lg hover:shadow-md text-base font-medium transition-all duration-200 flex items-center space-x-2 ${isEditing
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

      {/* Bảng danh sách phòng */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Khách sạn</th>
              <th className="border px-4 py-2">Tên phòng</th>
              <th className="border px-4 py-2">Loại</th>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Loại giường</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <Loading message="Đang tải danh sách phòng..." color="indigo" size="sm" />
                </td>
              </tr>
            ) : filteredRooms.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  {rooms.length === 0 
                    ? "Không có phòng nào." 
                    : "Không tìm thấy phòng nào phù hợp với bộ lọc."}
                </td>
              </tr>
            ) : (
              filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="border px-4 py-2">{room.id}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col">
                      <span className="font-semibold">{getHotelName(room.hotel_id) || `Hotel #${room.hotel_id}`}</span>
                      <span className="text-xs text-gray-500">ID: {room.hotel_id}</span>
                    </div>
                  </td>
                  <td className="border px-4 py-2">{room.name}</td>
                  <td className="border px-4 py-2">
                    {getRoomTypeName(room.room_type_id)}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(room.photos) &&
                        room.photos
                          .slice(0, 2)
                          .map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`room-${room.id}-${idx}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ))}
                      {room.photos?.length > 2 && (
                        <span className="text-sm text-gray-500 ml-1">
                          +{room.photos.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{room.bed_type}</td>
                  <td className="border px-4 py-2">
                    {room.price_per_night 
                      ? formatNumber(Math.round(parseFloat(room.price_per_night))) + " đ"
                      : "N/A"
                    }
                  </td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        room.status === "available"
                          ? "bg-green-100 text-green-800"
                          : room.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(room),
                        },
                        {
                          divider: true,
                        },
                        {
                          label: "Sửa",
                          icon: "fas fa-edit",
                          onClick: () => handleEdit(room),
                        },
                        {
                          label: "Xóa",
                          icon: "fas fa-trash-alt",
                          onClick: () => handleDelete(room.id),
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
      {isDetailModalOpen && selectedRoom && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 rounded-t-2xl z-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedRoom.name}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-hotel mr-2"></i>
                      {getHotelName(selectedRoom.hotel_id) || `Hotel #${selectedRoom.hotel_id}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white ${
                    selectedRoom.status === "available"
                      ? "text-green-800 border-green-300"
                      : "text-yellow-800 border-yellow-300"
                  }`}
                >
                  <i className={`fas ${selectedRoom.status === "available" ? "fa-check-circle" : "fa-tools"} mr-1`}></i>
                  {getStatusLabel(selectedRoom.status)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Photos */}
              {selectedRoom.photos && Array.isArray(selectedRoom.photos) && selectedRoom.photos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-images mr-2 text-blue-700"></i>
                    Hình ảnh phòng
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedRoom.photos.map((photo, idx) => (
                      <div key={idx} className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={photo}
                          alt={`${selectedRoom.name} - ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedRoom.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-align-left mr-2 text-blue-700"></i>
                    Mô tả
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedRoom.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Room Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-blue-700"></i>
                  Thông tin phòng
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedRoom.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Khách sạn</p>
                    <p className="font-medium text-gray-900">{getHotelName(selectedRoom.hotel_id) || `Hotel #${selectedRoom.hotel_id}`}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Loại phòng</p>
                    <p className="font-medium text-gray-900">{getRoomTypeName(selectedRoom.room_type_id)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Số người tối đa</p>
                    <p className="font-medium text-gray-900">{selectedRoom.max_people || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Diện tích</p>
                    <p className="font-medium text-gray-900">{selectedRoom.area_sqm ? `${selectedRoom.area_sqm} m²` : "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Loại giường</p>
                    <p className="font-medium text-gray-900">{selectedRoom.bed_type || "N/A"}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Giá mỗi đêm</p>
                    <p className="font-medium text-gray-900">
                      {selectedRoom.price_per_night 
                        ? formatNumber(Math.round(parseFloat(selectedRoom.price_per_night))) + " đ"
                        : "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <p className="font-medium text-gray-900">{getStatusLabel(selectedRoom.status)}</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedRoom);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Sửa phòng</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDelete(selectedRoom.id);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa phòng</span>
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
        onConfirm={confirmDialog.onConfirm || (() => { })}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type}
      />
    </div>
  );
};

export default RoomManagement;
