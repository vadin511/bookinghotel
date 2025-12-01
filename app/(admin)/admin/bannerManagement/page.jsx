"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addBanner,
  deleteBanner,
  fetchBanners,
  updateBanner,
} from "../../../store/features/bannerSlice";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import Image from "next/image";
import ActionDropdown from "@/components/common/ActionDropdown";

const BannerManagement = () => {
  const dispatch = useDispatch();
  const { data: banners, loading, error } = useSelector((state) => state.banners);

  const [addedPhoto, setAddedPhoto] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    image_url: "",
    link: "",
    is_active: 1,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const upload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    data.append("photos", files[0]);

    try {
      const res = await axios.post("http://localhost:3000/api/upload", data);
      const { files: uploadedFilenames } = res.data;

      if (uploadedFilenames && uploadedFilenames.length > 0) {
        const photoPath = `/uploads/${uploadedFilenames[0]}`;
        setAddedPhoto(photoPath);
        setFormData((prev) => ({
          ...prev,
          image_url: photoPath,
        }));
        toast.success("Upload ảnh thành công!");
      }
    } catch (err) {
      toast.error("Không thể upload ảnh. Vui lòng thử lại.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const bannerData = {
      title: formData.title?.trim() || null,
      image_url: formData.image_url?.trim(),
      link: formData.link?.trim() || null,
      is_active: formData.is_active,
    };

    if (!bannerData.image_url) {
      toast.error("Vui lòng upload ảnh banner!");
      return;
    }

    if (isEditing) {
      dispatch(updateBanner({ id: formData.id, data: bannerData })).then((result) => {
        if (updateBanner.fulfilled.match(result)) {
          toast.success("Cập nhật banner thành công!");
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Cập nhật banner thất bại!");
        }
      });
    } else {
      dispatch(addBanner(bannerData)).then((result) => {
        if (addBanner.fulfilled.match(result)) {
          toast.success("Thêm banner thành công!");
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Thêm banner thất bại!");
        }
      });
    }
  };

  useEffect(() => {
    dispatch(fetchBanners(true)); // Lấy tất cả banners bao gồm inactive
  }, [dispatch]);

  // Filter banners by status
  const filteredBanners = banners.filter((banner) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return banner.is_active === 1;
    if (statusFilter === "inactive") return banner.is_active === 0;
    return true;
  });

  const handleEdit = (banner) => {
    setFormData({
      id: banner.id,
      title: banner.title || "",
      image_url: banner.image_url || "",
      link: banner.link || "",
      is_active: banner.is_active !== undefined ? banner.is_active : 1,
    });
    setAddedPhoto(banner.image_url || "");
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const banner = banners.find((b) => b.id === id);
    const bannerTitle = banner ? (banner.title || `Banner #${banner.id}`) : "banner này";

    setConfirmDialog({
      isOpen: true,
      title: "Xóa banner",
      message: `Bạn có chắc chắn muốn xóa "${bannerTitle}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      type: "danger",
      onConfirm: () => {
        dispatch(deleteBanner(id)).then((result) => {
          if (deleteBanner.fulfilled.match(result)) {
            toast.success(`Xóa "${bannerTitle}" thành công!`);
          } else {
            toast.error(result.payload || `Xóa "${bannerTitle}" thất bại!`);
          }
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      image_url: "",
      link: "",
      is_active: 1,
    });
    setAddedPhoto("");
  };

  const toggleActive = (banner) => {
    dispatch(
      updateBanner({
        id: banner.id,
        data: { is_active: banner.is_active ? 0 : 1 },
      })
    ).then((result) => {
      if (updateBanner.fulfilled.match(result)) {
        toast.success(
          `Banner đã được ${banner.is_active ? "ẩn" : "hiển thị"} thành công!`
        );
      } else {
        toast.error("Cập nhật trạng thái banner thất bại!");
      }
    });
  };

  const openDetailModal = (banner) => {
    setSelectedBanner(banner);
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
      <h2 className="text-3xl font-bold mb-4">Quản lý Banners</h2>

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
          <span>Thêm Banner</span>
        </button>
        <div className="w-full sm:w-auto sm:min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo trạng thái:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hiển thị</option>
            <option value="inactive">Ẩn</option>
          </select>
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
            className="bg-white p-6 rounded shadow-md w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-4">
              {isEditing ? "Cập nhật Banner" : "Thêm Banner Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-base">Tiêu đề (tùy chọn):</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Tiêu đề banner"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Upload ảnh:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  className="mb-2"
                />
                {formData.image_url && (
                  <div className="mt-2">
                    <div className="relative w-full h-64 border border-gray-300 rounded overflow-hidden group">
                      <Image
                        src={formData.image_url}
                        alt="Banner preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image_url: "",
                          }));
                          setAddedPhoto("");
                          toast.success("Đã xóa ảnh!");
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        title="Xóa ảnh"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Link URL (tùy chọn):</label>
                <input
                  type="url"
                  name="link"
                  placeholder="https://example.com"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <p className="text-sm text-gray-500 mt-1">
                  URL sẽ được mở khi người dùng click vào banner
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active === 1}
                  onChange={handleChange}
                  className="w-5 h-5"
                />
                <label htmlFor="is_active" className="font-medium text-base">
                  Hiển thị banner
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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

      {/* Bảng danh sách banners */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Tiêu đề</th>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Link URL</th>
              <th className="border px-4 py-2">Trạng thái</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <Loading message="Đang tải danh sách banners..." color="indigo" size="sm" />
                </td>
              </tr>
            ) : filteredBanners.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  {statusFilter !== "all" 
                    ? `Không có banner nào với trạng thái "${statusFilter === "active" ? "Hiển thị" : "Ẩn"}"` 
                    : "Không có banner nào."}
                </td>
              </tr>
            ) : (
              filteredBanners.map((banner) => (
                <tr key={banner.id} className={banner.is_active === 0 ? "opacity-60" : ""}>
                  <td className="border px-4 py-2">{banner.id}</td>
                  <td className="border px-4 py-2">
                    {banner.title || <span className="text-gray-400">(Không có tiêu đề)</span>}
                  </td>
                  <td className="border px-4 py-2">
                    <div className="relative w-24 h-16">
                      <Image
                        src={banner.image_url}
                        alt={banner.title || `Banner ${banner.id}`}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    {banner.link ? (
                      <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate block max-w-xs"
                      >
                        {banner.link}
                      </a>
                    ) : (
                      <span className="text-gray-400">(Không có link)</span>
                    )}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        banner.is_active === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {banner.is_active === 1 ? "Hiển thị" : "Ẩn"}
                    </span>
                  </td>
                  <td className="border px-4 py-2">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(banner),
                        },
                        {
                          divider: true,
                        },
                        {
                          label: banner.is_active === 1 ? "Ẩn" : "Hiện",
                          icon: banner.is_active === 1 ? "fas fa-eye-slash" : "fas fa-eye",
                          onClick: () => toggleActive(banner),
                        },
                        {
                          label: "Sửa",
                          icon: "fas fa-edit",
                          onClick: () => handleEdit(banner),
                        },
                        {
                          label: "Xóa",
                          icon: "fas fa-trash-alt",
                          onClick: () => handleDelete(banner.id),
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
      {isDetailModalOpen && selectedBanner && (
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
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedBanner.title || `Banner #${selectedBanner.id}`}
                  </h2>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-green-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white ${
                    selectedBanner.is_active === 1
                      ? "text-green-800 border-green-300"
                      : "text-gray-800 border-gray-300"
                  }`}
                >
                  <i className={`fas ${selectedBanner.is_active === 1 ? "fa-eye" : "fa-eye-slash"} mr-1`}></i>
                  {selectedBanner.is_active === 1 ? "Hiển thị" : "Ẩn"}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image */}
              {selectedBanner.image_url && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-image mr-2 text-green-700"></i>
                    Hình ảnh banner
                  </h3>
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={selectedBanner.image_url}
                      alt={selectedBanner.title || `Banner ${selectedBanner.id}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Banner Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-green-700"></i>
                  Thông tin banner
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedBanner.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    <p className="font-medium text-gray-900">
                      {selectedBanner.is_active === 1 ? "Hiển thị" : "Ẩn"}
                    </p>
                  </div>
                  {selectedBanner.title && (
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Tiêu đề</p>
                      <p className="font-medium text-gray-900">{selectedBanner.title}</p>
                    </div>
                  )}
                  {selectedBanner.link && (
                    <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Link URL</p>
                      <a
                        href={selectedBanner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 break-all"
                      >
                        {selectedBanner.link}
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
                    toggleActive(selectedBanner);
                  }}
                  className={`px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md ${
                    selectedBanner.is_active === 1
                      ? "bg-gray-600 hover:bg-gray-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  <i className={`fas ${selectedBanner.is_active === 1 ? "fa-eye-slash" : "fa-eye"}`}></i>
                  <span>{selectedBanner.is_active === 1 ? "Ẩn" : "Hiện"}</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleEdit(selectedBanner);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Sửa banner</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDelete(selectedBanner.id);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa banner</span>
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

export default BannerManagement;

