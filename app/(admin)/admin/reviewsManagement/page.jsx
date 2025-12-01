"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loading from "@/components/common/Loading";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ActionDropdown from "@/components/common/ActionDropdown";

const ReviewsManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "danger",
  });
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filter, setFilter] = useState({
    hotel_id: "",
    user_id: "",
    rating: "",
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "/api/reviews?";
      const params = [];
      
      if (filter.hotel_id) {
        params.push(`hotel_id=${filter.hotel_id}`);
      }
      if (filter.user_id) {
        params.push(`user_id=${filter.user_id}`);
      }
      
      url += params.join("&");
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Không thể tải danh sách đánh giá");
      }

      let data = await res.json();
      
      // Filter by rating if specified
      if (filter.rating) {
        data = data.filter(r => r.rating === parseInt(filter.rating));
      }
      
      setReviews(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = (review) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xóa đánh giá",
      message: `Bạn có chắc chắn muốn xóa đánh giá của ${review.user_name || "người dùng"} cho khách sạn ${review.hotel_name || ""}?`,
      type: "danger",
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/reviews/${review.id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message || "Không thể xóa đánh giá");
          }

          toast.success("Xóa đánh giá thành công!");
          fetchReviews();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        } catch (err) {
          toast.error(err.message);
        }
      },
    });
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

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`fas fa-star ${
          i < rating ? "text-amber-400" : "text-gray-300"
        }`}
      ></i>
    ));
  };

  const getRatingBadge = (rating) => {
    const colors = {
      5: "bg-green-100 text-green-800",
      4: "bg-blue-100 text-blue-800",
      3: "bg-yellow-100 text-yellow-800",
      2: "bg-orange-100 text-orange-800",
      1: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${
          colors[rating] || "bg-gray-100 text-gray-800"
        }`}
      >
        {rating} sao
      </span>
    );
  };

  const handleFilterChange = (field, value) => {
    setFilter({ ...filter, [field]: value });
  };

  const handleApplyFilter = () => {
    fetchReviews();
  };

  const handleResetFilter = () => {
    setFilter({ hotel_id: "", user_id: "", rating: "" });
    setTimeout(() => {
      fetchReviews();
    }, 100);
  };

  const openDetailModal = (review) => {
    setSelectedReview(review);
    setIsDetailModalOpen(true);
  };

  // Tính toán thống kê
  const stats = {
    total: reviews.length,
    averageRating:
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1)
        : 0,
    ratingCounts: {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Quản lý đánh giá
        </h1>
        <p className="text-gray-600 text-lg">
          Xem và quản lý tất cả các đánh giá của khách hàng
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Tổng đánh giá</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-star text-blue-500 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Đánh giá trung bình</p>
              <p className="text-3xl font-bold text-gray-800">
                {stats.averageRating}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <i className="fas fa-chart-line text-amber-500 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">5 sao</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.ratingCounts[5]}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-star text-green-500 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">1-2 sao</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.ratingCounts[1] + stats.ratingCounts[2]}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bộ lọc</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khách sạn ID
            </label>
            <input
              type="number"
              value={filter.hotel_id}
              onChange={(e) => handleFilterChange("hotel_id", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Nhập ID khách sạn"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người dùng ID
            </label>
            <input
              type="number"
              value={filter.user_id}
              onChange={(e) => handleFilterChange("user_id", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              placeholder="Nhập ID người dùng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá
            </label>
            <select
              value={filter.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex-1"
            >
              <i className="fas fa-filter mr-2"></i>
              Lọc
            </button>
            <button
              onClick={handleResetFilter}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <i className="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>

      {loading && reviews.length === 0 && (
        <Loading message="Đang tải danh sách đánh giá..." color="indigo" className="py-12" />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-base">{error}</p>
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">
            Chưa có đánh giá nào
          </h2>
          <p className="text-gray-500 text-lg">
            Hiện tại chưa có đánh giá nào trong hệ thống.
          </p>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Khách sạn
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Đánh giá
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Nhận xét
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                      #{review.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {review.user_avatar ? (
                          <img
                            src={review.user_avatar}
                            alt={review.user_name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                            <span className="text-gray-600 font-semibold">
                              {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-base text-gray-900">
                            {review.user_name || `User #${review.user_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {review.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                      {review.hotel_name || `Hotel #${review.hotel_id}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex">{getRatingStars(review.rating)}</div>
                        {getRatingBadge(review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-base text-gray-900 max-w-md">
                      <p className="truncate" title={review.comment || "Không có nhận xét"}>
                        {review.comment || (
                          <span className="text-gray-400 italic">
                            Không có nhận xét
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-base text-gray-900">
                      {formatDate(review.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionDropdown
                        actions={[
                          {
                            label: "Xem chi tiết",
                            icon: "fas fa-eye",
                            onClick: () => openDetailModal(review),
                          },
                          {
                            divider: true,
                          },
                          {
                            label: "Xóa",
                            icon: "fas fa-trash",
                            onClick: () => handleDeleteReview(review),
                            danger: true,
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedReview && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-700 to-amber-800 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">Đánh giá #{selectedReview.id}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      {selectedReview.user_name || `User #${selectedReview.user_id}`}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-hotel mr-2"></i>
                      {selectedReview.hotel_name || `Hotel #${selectedReview.hotel_id}`}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex">{getRatingStars(selectedReview.rating)}</div>
                  {getRatingBadge(selectedReview.rating)}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {/* User Info */}
              <div className="mb-6 flex items-center space-x-4">
                {selectedReview.user_avatar ? (
                  <img
                    src={selectedReview.user_avatar}
                    alt={selectedReview.user_name}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-semibold text-xl">
                      {selectedReview.user_name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedReview.user_name || `User #${selectedReview.user_id}`}
                  </p>
                  <p className="text-sm text-gray-500">ID: {selectedReview.user_id}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-star mr-2 text-amber-700"></i>
                  Đánh giá
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-2xl">{getRatingStars(selectedReview.rating)}</div>
                    {getRatingBadge(selectedReview.rating)}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {selectedReview.comment && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    <i className="fas fa-comment-alt mr-2 text-amber-700"></i>
                    Nhận xét
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedReview.comment}
                    </p>
                  </div>
                </div>
              )}

              {/* Review Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-amber-700"></i>
                  Thông tin đánh giá
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedReview.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedReview.created_at)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Khách sạn</p>
                    <p className="font-medium text-gray-900">
                      {selectedReview.hotel_name || `Hotel #${selectedReview.hotel_id}`}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Người đánh giá</p>
                    <p className="font-medium text-gray-900">
                      {selectedReview.user_name || `User #${selectedReview.user_id}`}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleDeleteReview(selectedReview);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa đánh giá</span>
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
        type={confirmDialog.type}
      />
    </div>
  );
};

export default ReviewsManagementPage;



