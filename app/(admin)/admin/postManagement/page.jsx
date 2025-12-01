"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addPost,
  deletePost,
  fetchPosts,
  updatePost,
} from "../../../store/features/postSlice";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import Image from "next/image";
import ActionDropdown from "@/components/common/ActionDropdown";

const PostManagement = () => {
  const dispatch = useDispatch();
  const { list: posts, loading, error } = useSelector((state) => state.posts);

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
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    content: "",
    image: "",
    category: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          image: photoPath,
        }));
        toast.success("Upload ảnh thành công!");
      }
    } catch (err) {
      toast.error("Không thể upload ảnh. Vui lòng thử lại.");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const postData = {
      title: formData.title?.trim(),
      content: formData.content?.trim(),
      image: formData.image?.trim() || null,
      category: formData.category?.trim() || null,
    };

    if (!postData.title || !postData.content) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung!");
      return;
    }

    if (isEditing) {
      dispatch(updatePost({ id: formData.id, data: postData })).then((result) => {
        if (updatePost.fulfilled.match(result)) {
          toast.success("Cập nhật bài viết thành công!");
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Cập nhật bài viết thất bại!");
        }
      });
    } else {
      dispatch(addPost(postData)).then((result) => {
        if (addPost.fulfilled.match(result)) {
          toast.success("Thêm bài viết thành công!");
          setIsModalOpen(false);
          setIsEditing(false);
          resetForm();
        } else {
          toast.error(result.payload || "Thêm bài viết thất bại!");
        }
      });
    }
  };

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleEdit = (post) => {
    setFormData({
      id: post.id,
      title: post.title || "",
      content: post.content || "",
      image: post.image || "",
      category: post.category || "",
    });
    setAddedPhoto(post.image || "");
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const post = posts.find((p) => p.id === id);
    const postTitle = post ? post.title : "bài viết này";

    setConfirmDialog({
      isOpen: true,
      title: "Xóa bài viết",
      message: `Bạn có chắc chắn muốn xóa bài viết "${postTitle}"? Hành động này không thể hoàn tác.`,
      confirmText: "Xóa",
      type: "danger",
      onConfirm: () => {
        dispatch(deletePost(id)).then((result) => {
          if (deletePost.fulfilled.match(result)) {
            toast.success(`Xóa bài viết "${postTitle}" thành công!`);
          } else {
            toast.error(result.payload || `Xóa bài viết "${postTitle}" thất bại!`);
          }
        });
      },
    });
  };

  const resetForm = () => {
    setFormData({
      id: null,
      title: "",
      content: "",
      image: "",
      category: "",
    });
    setAddedPhoto("");
  };

  const openDetailModal = (post) => {
    setSelectedPost(post);
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
      <h2 className="text-3xl font-bold mb-4">Quản lý Bài Viết</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-base">
          {error}
        </div>
      )}

      <button
        onClick={() => {
          setIsModalOpen(true);
          setIsEditing(false);
          resetForm();
        }}
        className="mb-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-5 py-2.5 rounded-lg hover:from-green-600 hover:to-green-700 text-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
      >
        <i className="fas fa-plus-circle"></i>
        <span>Thêm Bài Viết</span>
      </button>

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
            className="bg-white p-6 rounded shadow-md w-full max-w-4xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold mb-4">
              {isEditing ? "Cập nhật Bài Viết" : "Thêm Bài Viết Mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium text-base">
                  Tiêu đề <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="Nhập tiêu đề bài viết"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">
                  Danh mục (tùy chọn):
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="Ví dụ: Du lịch, Khách sạn, Ẩm thực..."
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">
                  Nội dung <span className="text-red-500">*</span>:
                </label>
                <textarea
                  name="content"
                  placeholder="Nhập nội dung bài viết..."
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={10}
                  className="w-full p-2 border border-gray-300 rounded resize-y"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-base">Upload ảnh (tùy chọn):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  className="mb-2"
                />
                {formData.image && (
                  <div className="mt-2">
                    <div className="relative w-full h-64 border border-gray-300 rounded overflow-hidden group">
                      <Image
                        src={formData.image}
                        alt="Post preview"
                        fill
                        className="object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            image: "",
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

      {/* Bảng danh sách bài viết */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">ID</th>
              <th className="border px-4 py-2">Tiêu đề</th>
              <th className="border px-4 py-2">Danh mục</th>
              <th className="border px-4 py-2">Ảnh</th>
              <th className="border px-4 py-2">Nội dung</th>
              <th className="border px-4 py-2">Ngày tạo</th>
              <th className="border px-4 py-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <Loading message="Đang tải danh sách bài viết..." color="indigo" size="sm" />
                </td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  Không có bài viết nào.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td className="border px-4 py-2">{post.id}</td>
                  <td className="border px-4 py-2 font-medium max-w-xs">
                    <div className="truncate" title={post.title}>
                      {post.title}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    {post.category || <span className="text-gray-400">(Không có)</span>}
                  </td>
                  <td className="border px-4 py-2">
                    {post.image ? (
                      <div className="relative w-24 h-16">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-400">(Không có ảnh)</span>
                    )}
                  </td>
                  <td className="border px-4 py-2 max-w-xs">
                    <div className="truncate max-w-xs" title={post.content}>
                      {post.content.substring(0, 50)}
                      {post.content.length > 50 && "..."}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    {post.created_at
                      ? new Date(post.created_at).toLocaleDateString("vi-VN")
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">
                    <ActionDropdown
                      actions={[
                        {
                          label: "Xem chi tiết",
                          icon: "fas fa-eye",
                          onClick: () => openDetailModal(post),
                        },
                        {
                          divider: true,
                        },
                        {
                          label: "Sửa",
                          icon: "fas fa-edit",
                          onClick: () => handleEdit(post),
                        },
                        {
                          label: "Xóa",
                          icon: "fas fa-trash-alt",
                          onClick: () => handleDelete(post.id),
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
      {isDetailModalOpen && selectedPost && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-6 rounded-t-2xl z-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedPost.title}</h2>
                  {selectedPost.category && (
                    <div className="flex items-center space-x-4 text-sm mt-2">
                      <span className="flex items-center">
                        <i className="fas fa-tag mr-2"></i>
                        {selectedPost.category}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-indigo-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4">
                <span className="text-sm opacity-90">
                  <i className="fas fa-calendar mr-2"></i>
                  {formatDate(selectedPost.created_at)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* Image */}
              {selectedPost.image && (
                <div className="mb-6">
                  <div className="relative w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={selectedPost.image}
                      alt={selectedPost.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-file-alt mr-2 text-indigo-700"></i>
                  Nội dung bài viết
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              {/* Post Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-indigo-700"></i>
                  Thông tin bài viết
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedPost.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedPost.created_at)}</p>
                  </div>
                  {selectedPost.category && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Danh mục</p>
                      <p className="font-medium text-gray-900">{selectedPost.category}</p>
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
                    handleEdit(selectedPost);
                  }}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-edit"></i>
                  <span>Sửa bài viết</span>
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDelete(selectedPost.id);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa bài viết</span>
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

export default PostManagement;

