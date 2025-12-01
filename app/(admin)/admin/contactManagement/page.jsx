"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import Loading from "@/components/common/Loading";
import ActionDropdown from "@/components/common/ActionDropdown";

const ContactManagementPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "info",
  });

  // Fetch contacts
  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const url = `/api/contacts?${params.toString()}`;
      
      const res = await fetch(url, {
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          try {
            const refreshRes = await fetch("/api/refresh", {
              method: "POST",
              credentials: "include",
            });
            
            if (refreshRes.ok) {
              const retryRes = await fetch(url, {
                credentials: "include",
              });
              
              if (!retryRes.ok) {
                throw new Error("Không thể tải danh sách liên hệ");
              }
              
              const data = await retryRes.json();
              setContacts(data.contacts || []);
              setPagination(data.pagination || pagination);
              return;
            } else {
              window.location.href = "/login";
              return;
            }
          } catch (refreshErr) {
            window.location.href = "/login";
            return;
          }
        }
        throw new Error("Không thể tải danh sách liên hệ");
      }

      const data = await res.json();
      setContacts(data.contacts || []);
      setPagination(data.pagination || pagination);
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
      toast.error(err.message || "Có lỗi xảy ra khi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [selectedStatus, pagination.page]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      if (pagination.page === 1) {
        fetchContacts();
      } else {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Format ngày tháng
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

  // Format status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: {
        text: "Chờ xử lý",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: "fa-clock",
      },
      read: {
        text: "Đã đọc",
        color: "bg-blue-100 text-blue-800 border-blue-300",
        icon: "fa-check",
      },
      replied: {
        text: "Đã phản hồi",
        color: "bg-green-100 text-green-800 border-green-300",
        icon: "fa-reply",
      },
      resolved: {
        text: "Đã giải quyết",
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: "fa-check-circle",
      },
    };

    return statusMap[status] || {
      text: status,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: "fa-question",
    };
  };

  // Cập nhật status
  const handleUpdateStatus = async (contactId, newStatus) => {
    setUpdatingId(contactId);
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Không thể cập nhật status");
      }

      toast.success("Cập nhật trạng thái thành công");
      fetchContacts();
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setUpdatingId(null);
    }
  };

  // Xóa contact
  const handleDelete = async (contactId) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Không thể xóa liên hệ");
      }

      toast.success("Xóa liên hệ thành công");
      fetchContacts();
      setIsDetailModalOpen(false);
    } catch (err) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const openDeleteDialog = (contact) => {
    setConfirmDialog({
      isOpen: true,
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa liên hệ từ "${contact.user_name || "Khách vãng lai"}" với tiêu đề "${contact.subject}"?`,
      type: "danger",
      onConfirm: () => {
        handleDelete(contact.id);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  const openDetailModal = (contact) => {
    setSelectedContact(contact);
    setIsDetailModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  if (loading && contacts.length === 0) {
    return (
      <Loading 
        message="Đang tải danh sách liên hệ..." 
        color="indigo"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Quản lý Liên hệ
        </h1>
        <p className="text-gray-600 text-lg">
          Xem và quản lý tất cả các tin nhắn liên hệ từ người dùng
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm (tên/email/tiêu đề):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập tên, email, tiêu đề hoặc nội dung..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo trạng thái:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="replied">Đã phản hồi</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading && contacts.length === 0 && (
        <Loading 
          message="Đang tải danh sách liên hệ..." 
          color="indigo"
          className="py-12"
        />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 text-base">{error}</p>
        </div>
      )}

      {!loading && contacts.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-3xl font-semibold text-gray-700 mb-2">
            Chưa có liên hệ nào
          </h2>
          <p className="text-gray-500 text-lg">Hiện tại chưa có tin nhắn liên hệ nào trong hệ thống.</p>
        </div>
      )}

      {!loading && contacts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      contact.status === "pending" ? "bg-yellow-50" : ""
                    }`}
                    onClick={() => openDetailModal(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-gray-900">
                      #{contact.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-base font-medium text-gray-900">
                          {contact.user_name || "Khách vãng lai"}
                          {contact.status === "pending" && (
                            <span className="ml-2 inline-block w-2 h-2 bg-yellow-500 rounded-full"></span>
                          )}
                        </p>
                        {contact.user_email && (
                          <p className="text-sm text-gray-500">
                            <i className="fas fa-envelope mr-1"></i>
                            {contact.user_email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-base font-medium text-gray-900 max-w-xs truncate" title={contact.subject}>
                        {contact.subject}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-base text-gray-700 max-w-md truncate" title={contact.message}>
                        {contact.message}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(contact.status).color}`}
                      >
                        <i className={`fas ${getStatusBadge(contact.status).icon} mr-1`}></i>
                        {getStatusBadge(contact.status).text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <i className="fas fa-calendar mr-2 text-gray-400"></i>
                        {formatDate(contact.created_at)}
                      </div>
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <ActionDropdown
                          actions={[
                            {
                              label: "Xem chi tiết",
                              icon: "fas fa-eye",
                              onClick: () => {
                                openDetailModal(contact);
                              },
                            },
                            {
                              divider: true,
                            },
                            {
                              label: "Chờ xử lý",
                              icon: "fas fa-clock",
                              onClick: () => {
                                handleUpdateStatus(contact.id, "pending");
                              },
                              disabled: updatingId === contact.id || contact.status === "pending",
                            },
                            {
                              label: "Đã phản hồi",
                              icon: "fas fa-reply",
                              onClick: () => {
                                handleUpdateStatus(contact.id, "replied");
                              },
                              disabled: updatingId === contact.id || contact.status === "replied",
                              success: true,
                            },
                            {
                              divider: true,
                            },
                            {
                              label: "Xóa",
                              icon: "fas fa-trash",
                              onClick: () => {
                                openDeleteDialog(contact);
                              },
                              danger: true,
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="text-sm text-gray-600">
                Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số{" "}
                {pagination.total} liên hệ
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Chỉ hiển thị trang hiện tại, 2 trang trước và 2 trang sau
                    const current = pagination.page;
                    return (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= current - 2 && page <= current + 2)
                    );
                  })
                  .map((page, index, array) => {
                    // Thêm dấu ... nếu có khoảng trống
                    const showEllipsis = index > 0 && array[index - 1] !== page - 1;
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg transition-colors ${
                            pagination.page === page
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedContact && (
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn p-4"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-700 to-amber-800 text-white p-6 rounded-t-2xl z-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">{selectedContact.subject}</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-user mr-2"></i>
                      {selectedContact.user_name || "Khách vãng lai"}
                    </span>
                    {selectedContact.user_email && (
                      <span className="flex items-center">
                        <i className="fas fa-envelope mr-2"></i>
                        {selectedContact.user_email}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="ml-4 p-2 hover:bg-amber-600 rounded-lg transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(selectedContact.status).color} bg-white`}
                >
                  <i className={`fas ${getStatusBadge(selectedContact.status).icon} mr-1`}></i>
                  {getStatusBadge(selectedContact.status).text}
                </span>
                <span className="text-sm opacity-90">
                  <i className="fas fa-calendar mr-2"></i>
                  {formatDate(selectedContact.created_at)}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-comment-alt mr-2 text-amber-700"></i>
                  Nội dung tin nhắn
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  <i className="fas fa-info-circle mr-2 text-amber-700"></i>
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">ID</p>
                    <p className="font-medium text-gray-900">#{selectedContact.id}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ngày gửi</p>
                    <p className="font-medium text-gray-900">{formatDate(selectedContact.created_at)}</p>
                  </div>
                  {selectedContact.updated_at && selectedContact.updated_at !== selectedContact.created_at && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Ngày cập nhật</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedContact.updated_at)}</p>
                    </div>
                  )}
                  {selectedContact.user_email && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Email liên hệ</p>
                      <a
                        href={`mailto:${selectedContact.user_email}`}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {selectedContact.user_email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedContact.id, "pending");
                      setSelectedContact({ ...selectedContact, status: "pending" });
                    }}
                    disabled={updatingId === selectedContact.id || selectedContact.status === "pending"}
                    className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-clock"></i>
                    <span>Chờ xử lý</span>
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedContact.id, "replied");
                      setSelectedContact({ ...selectedContact, status: "replied" });
                    }}
                    disabled={updatingId === selectedContact.id || selectedContact.status === "replied"}
                    className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <i className="fas fa-reply"></i>
                    <span>Đã phản hồi</span>
                  </button>
                </div>
                <button
                  onClick={() => {
                    openDeleteDialog(selectedContact);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <i className="fas fa-trash"></i>
                  <span>Xóa liên hệ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
};

export default ContactManagementPage;
