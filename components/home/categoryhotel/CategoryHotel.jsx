"use client";
import { useEffect, useState } from "react";
import axios from "axios";

const CategoryHotel = () => {
  const [formData, setFormData] = useState({
    name: "",
    hotel_id: "",
    type_id: "",
    max_guests: "",
    photos: "", // ảnh sẽ là chuỗi URL cách nhau bởi dấu phẩy
    area_sqm: "",
    bed_type: "",
    price_per_night: "",
    status: "available",
  });

  const [rooms, setRooms] = useState([]);
  const [addedPhotos, setAddedPhotos] = useState([]);
const [photoLink, setPhotoLink] = useState("");

  // Gọi API để lấy danh sách phòng
  const fetchRooms = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/room");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("Lỗi khi load danh sách phòng:", err);
    }
  };
  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Upload ảnh từ máy
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
      photos: [...prev.photos.split(",").filter(Boolean), ...newPhotoPaths].join(","),
    }));
  } catch (err) {
    console.error("Lỗi khi upload ảnh:", err);
    alert("Không thể upload ảnh");
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: formData.photos.split(",").map((url) => url.trim()),
        }),
      });

      const data = await res.json();
   if (res.ok) {
  alert("Thêm phòng thành công!");
  setFormData({
    name: "",
    hotel_id: "",
    type_id: "",
    max_guests: "",
    photos: "",
    area_sqm: "",
    bed_type: "",
    price_per_night: "",
    status: "available",
  });
  setAddedPhotos([]);
  await fetchRooms(); // gọi lại danh sách mới từ DB
} {
        alert(data.message || "Có lỗi xảy ra.");
      }
    } catch (error) {
      console.error("Lỗi khi gửi phòng:", error);
      alert("Lỗi server");
    }
  };
  console.log(rooms);
  
  return (
    <div className="flex flex-col items-center gap-10 pt-10 pb-10">
      {/* Danh sách phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 max-w-6xl">
        {rooms.map((room, index) => (
          <div
            key={index}
            className="bg-[#f0ebe8] rounded-xl text-center overflow-hidden shadow-md"
          >
        <img
  alt={room.name}
  src={
    Array.isArray(room.photos) && room.photos[0]
      ? room.photos[0].startsWith("http")
        ? room.photos[0]
        : `http://localhost:3000${room.photos[0]}`
      : "https://via.placeholder.com/400x200?text=No+Image"
  }
  className="w-full h-48 object-cover"
/>
            <div className="p-4 text-[#5a4331]">
              <h2 className="text-xl font-semibold">{room.name}</h2>
              <p>Khách tối đa: {room.max_guests}</p>
              <p>Loại giường: {room.bed_type}</p>
              <p>Giá: ${room.price_per_night}/đêm</p>
              <p className="text-sm italic text-gray-500">
                Trạng thái: {room.status}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Form thêm phòng */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-lg shadow-md"
      >
        <h2 className="text-xl font-semibold mb-4">Thêm Phòng Mới</h2>

        {[
          { label: "Tên phòng", name: "name" },
          { label: "Hotel ID", name: "hotel_id" },
          { label: "Type ID", name: "type_id" },
          { label: "Số khách tối đa", name: "max_guests" },
          { label: "Diện tích (m2)", name: "area_sqm" },
          { label: "Loại giường", name: "bed_type" },
          { label: "Giá mỗi đêm", name: "price_per_night" },
          { label: "Trạng thái (available/booked)", name: "status" },
        ].map((field) => (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium mb-1">
              {field.label}
            </label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required={["name", "hotel_id", "type_id"].includes(field.name)}
            />
          </div>
        ))}

        {/* ✅ Upload ảnh */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tải ảnh</label>
          <input multiple type="file" onChange={upload} />
          <div className="flex gap-2 mt-2 flex-wrap">
          {addedPhotos.map((photo, idx) => (
  <img
    key={idx}
    src={photo.startsWith("http") ? photo : `http://localhost:3000${photo}`}
    width={80}
    height={80}
    className="object-cover rounded-md border"
/>
))}
          </div>
        </div>
<div className="mb-2 flex gap-2">
  <input
    type="text"
    placeholder="Nhập URL ảnh"
    value={photoLink}
    onChange={(e) => setPhotoLink(e.target.value)}
    className="flex-1 border px-3 py-2 rounded-md"
  />
  <button
    type="button"
    onClick={() => {
      if (!photoLink.trim()) return;
      const newUrl = photoLink.trim();
      setAddedPhotos((prev) => [...prev, newUrl]);
     setFormData((prev) => ({
  ...prev,
  photos: [...prev.photos.split(",").filter(Boolean), newUrl].join(","),
}));
      setPhotoLink(""); // reset ô nhập
    }}
    className="bg-blue-500 text-white px-3 py-2 rounded-md"
  >
    Thêm ảnh
  </button>
</div>
        <button
          type="submit"
          className="bg-[#5a4331] text-white px-4 py-2 rounded-md hover:bg-[#3e2e22] transition"
        >
          Thêm phòng
        </button>
      </form>

    </div>
  );
};

export default CategoryHotel;
