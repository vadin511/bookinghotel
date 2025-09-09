"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../../../store/features/roomSlice";

const RoomManagement = () => {
  const dispatch = useDispatch();
  const { list: rooms, loading, error } = useSelector((state) => state.rooms);

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    hotel_id: "",
    name: "",
    description: "",
    type_id: "",
    max_guests: "",
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
      console.error("Lỗi khi upload ảnh:", err);
      alert("Không thể upload ảnh");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      hotel_id: parseInt(formData.hotel_id),
      type_id: parseInt(formData.type_id),
      max_guests: parseInt(formData.max_guests),
      area_sqm: parseFloat(formData.area_sqm),
      price_per_night: parseFloat(formData.price_per_night),
      photos: formData.photos.split(",").map((url) => url.trim()),
    };

    if (isEditing) {
      dispatch(updateRoom(roomData)).then(() => {
        dispatch(fetchRooms());
      });
    } else {
      dispatch(addRoom(roomData)).then(() => {
        dispatch(fetchRooms());
      });
    }

    setIsModalOpen(false);
    setIsEditing(false);
    resetForm();
  };

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  const handleEdit = (room) => {
    setFormData({
      ...room,
      photos: Array.isArray(room.photos) ? room.photos.join(", ") : room.photos,
      max_guests: room.max_guests?.toString() || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Bạn có chắc muốn xoá phòng này?")) {
      dispatch(deleteRoom(id)).then(() => {
        dispatch(fetchRooms());
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      hotel_id: "",
      name: "",
      type_id: "",
      max_guests: "",
      photos: "",
      area_sqm: "",
      bed_type: "",
      price_per_night: "",
      status: "available",
    });
    setAddedPhotos([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Phòng</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <button
        onClick={() => {
          setIsModalOpen(true);
          setIsEditing(false);
          resetForm();
        }}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Thêm Phòng
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-xl relative">
            <h3 className="text-xl font-semibold mb-4">
              {isEditing ? "Cập nhật Phòng" : "Thêm Phòng Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="number"
                name="hotel_id"
                placeholder="ID khách sạn"
                value={formData.hotel_id}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                name="name"
                placeholder="Tên phòng"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name="type_id"
                placeholder="ID Phòng"
                value={formData.type_id}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name="max_guests"
                placeholder="Số người tối đa"
                value={formData.max_guests}
                onChange={handleChange}
                required
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
              <input
                type="text"
                name="bed_type"
                placeholder="Loại giường"
                value={formData.bed_type}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                step="0.01"
                name="price_per_night"
                placeholder="Giá mỗi đêm"
                value={formData.price_per_night}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded"
              />

              {/* Upload ảnh */}
              <div>
                <label className="block mb-1 font-medium">Upload ảnh:</label>
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
                        <img
                          key={idx}
                          src={photo.trim()}
                          alt="Ảnh phòng"
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                </div>
              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {isEditing ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bảng danh sách phòng */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Hotel ID</th>
              <th className="border px-4 py-2">Tên phòng</th>
              <th className="border px-4 py-2">Loại</th>
              <th className="border px-4 py-2">Số người</th>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Diện tích</th>
              <th className="border px-4 py-2">Loại giường</th>
              <th className="border px-4 py-2">Giá</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={11} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-4">
                  Không có phòng nào.
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td className="border px-4 py-2">{room.id}</td>
                  <td className="border px-4 py-2">{room.hotel_id}</td>
                  <td className="border px-4 py-2">{room.name}</td>
                  <td className="border px-4 py-2">{room.type_id}</td>
                  <td className="border px-4 py-2">{room.max_guests}</td>
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
                        <span className="text-xs text-gray-500 ml-1">
                          +{room.photos.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border px-4 py-2">{room.area_sqm} m²</td>
                  <td className="border px-4 py-2">{room.bed_type}</td>
                  <td className="border px-4 py-2">{room.price_per_night} đ</td>
                  <td className="border px-4 py-2 capitalize">{room.status}</td>
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoomManagement;
