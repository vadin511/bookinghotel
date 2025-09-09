"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addHotel,
  deleteHotel,
  fetchHotels,
  updateHotel,
} from "../../../store/features/hotelSlice";

const HotelManagement = () => {
  const dispatch = useDispatch();
  const { data: hotels, loading, error } = useSelector((state) => state.hotels);

  const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    address: "",
    description: "",
    category_id: "",
    type_id: "",
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
      console.error("Lỗi khi upload ảnh:", err);
      alert("Không thể upload ảnh");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hotelData = {
      ...formData,
      category_id: parseInt(formData.category_id) || null,
      type_id: parseInt(formData.type_id) || null,
      photos: formData.photos.split(",").map((url) => url.trim()),
    };

    if (isEditing) {
      dispatch(updateHotel({ id: formData.id, data: hotelData })).then(() => {
        dispatch(fetchHotels());
      });
    } else {
      dispatch(addHotel(hotelData)).then(() => {
        dispatch(fetchHotels());
      });
    }

    setIsModalOpen(false);
    setIsEditing(false);
    resetForm();
  };

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch]);

  const handleEdit = (hotel) => {
    setFormData({
      ...hotel,
      photos: Array.isArray(hotel.photos) ? hotel.photos.join(", ") : hotel.photos,
      category_id: hotel.category_id?.toString() || "",
      type_id: hotel.type_id?.toString() || "",
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm("Bạn có chắc chắn muốn xoá?")) {
      dispatch(deleteHotel(id)).then(() => {
        dispatch(fetchHotels());
      });
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: "",
      address: "",
      description: "",
      category_id: "",
      type_id: "",
      photos: "",
    });
    setAddedPhotos([]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Khách sạn</h2>

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
        + Thêm Khách sạn
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-xl relative">
            <h3 className="text-xl font-semibold mb-4">
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
              {/* <input
                type="number"
                name="category_id"
                placeholder="ID Danh mục"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                name="type_id"
                placeholder="ID Loại"
                value={formData.type_id}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              /> */}

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
                          alt="Ảnh khách sạn"
                          className="w-20 h-20 object-cover rounded"
                        />
                      ))}
                </div>
              </div>

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

      {/* Bảng danh sách khách sạn */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Tên</th>
              <th className="border px-4 py-2">Địa chỉ</th>
              <th className="border px-4 py-2">Ảnh</th>
              {/* <th className="border px-4 py-2">Danh mục</th>
              <th className="border px-4 py-2">Loại</th> */}
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Đang tải...
                </td>
              </tr>
            ) : hotels.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Không có khách sạn nào.
                </td>
              </tr>
            ) : (
              hotels.map((hotel, key ) => (
                <tr key={key}>
                  <td className="border px-4 py-2">{hotel.id}</td>
                  <td className="border px-4 py-2">{hotel.name}</td>
                  <td className="border px-4 py-2">{hotel.address}</td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(hotel.photos) &&
                        hotel.photos
                          .slice(0, 2)
                          .map((url, idx) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`hotel-${hotel.id}-${idx}`}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ))}
                      {hotel.photos?.length > 2 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{hotel.photos.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* <td className="border px-4 py-2">{hotel.category_id}</td>
                  <td className="border px-4 py-2">{hotel.type_id}</td> */}
                  <td className="border px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(hotel)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(hotel.id)}
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

export default HotelManagement;