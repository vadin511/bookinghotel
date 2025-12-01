"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectUser } from "../../app/store/features/userSlice";

const ContactForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const user = useSelector(selectUser);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }

    if (!formData.message.trim()) {
      toast.error("Vui lòng nhập nội dung tin nhắn");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Có lỗi xảy ra khi gửi tin nhắn");
      }

      toast.success("Gửi tin nhắn thành công! Chúng tôi sẽ phản hồi sớm nhất có thể.");
      setFormData({ subject: "", message: "" });
      setIsOpen(false);
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra khi gửi tin nhắn");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-700 hover:bg-amber-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Liên hệ với chúng tôi"
      >
        <i className="fas fa-comments text-2xl"></i>
      </button>

      {/* Contact Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 backdrop-blur-sm animate-fadeIn bg-opacity-50 z-500 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-amber-700 text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Liên hệ với chúng tôi</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setFormData({ subject: "", message: "" });
                }}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Đóng"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {user && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-600">
                    Đang đăng nhập với: <span className="font-semibold">{user.name}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block mb-2 text-[#5a4330] font-medium">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-700"
                  placeholder="Nhập tiêu đề tin nhắn"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-[#5a4330] font-medium">
                  Nội dung tin nhắn <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-amber-700 resize-none"
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setFormData({ subject: "", message: "" });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactForm;

