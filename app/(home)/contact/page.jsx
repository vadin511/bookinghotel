"use client";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-[#f9f9f9] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-[#5a4330] mb-6 text-center">
            Liên hệ với chúng tôi
          </h1>

          <div className="space-y-6 text-[#5a4330]">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                <i className="fas fa-envelope text-amber-700 mr-2"></i>
                Thông tin liên hệ
              </h2>
              <div className="space-y-3">
                <p className="text-lg">
                  <i className="fas fa-phone text-amber-700 mr-2"></i>
                  <strong>Hotline:</strong> 0989357834
                </p>
                <p className="text-lg">
                  <i className="fas fa-envelope text-amber-700 mr-2"></i>
                  <strong>Email:</strong> support@vadigo.com
                </p>
                <p className="text-lg">
                  <i className="fas fa-map-marker-alt text-amber-700 mr-2"></i>
                  <strong>Địa chỉ:</strong> Phố viên, Bắc Từ Liêm, Hà nội
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                <i className="fas fa-clock text-amber-700 mr-2"></i>
                Giờ làm việc
              </h2>
              <div className="space-y-2 text-lg">
                <p><strong>Thứ 2 - Thứ 6:</strong> 8:00 - 18:00</p>
                <p><strong>Thứ 7 - Chủ nhật:</strong> 9:00 - 17:00</p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">
                <i className="fas fa-comments text-amber-700 mr-2"></i>
                Gửi tin nhắn cho chúng tôi
              </h2>
              <p className="text-lg mb-4">
                Bạn có thể sử dụng nút liên hệ ở góc dưới bên phải màn hình để gửi tin nhắn cho chúng tôi bất cứ lúc nào.
                Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </p>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-base">
                  <i className="fas fa-info-circle text-amber-700 mr-2"></i>
                  <strong>Lưu ý:</strong> Nếu bạn đã đăng nhập, tin nhắn sẽ được gửi kèm thông tin tài khoản của bạn để chúng tôi có thể hỗ trợ tốt hơn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

