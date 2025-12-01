"use client";

import Image from "next/image";
import imgFooter from "../../../public/assets/images/imgFooter.jpg";

const Footer = () => {
  return (
    <div className="w-full relative">
      {/* Background với blur effect */}
      <div className="relative w-full">
        <div className="absolute inset-0">
          <Image
            src={imgFooter}
            alt="Footer background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        </div>
        
        {/* Content với border xanh */}
        <div className="relative  mx-auto max-w-7xl ">
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 p-8 md:p-12 text-white">
            {/* Cột trái - Thông báo pháp lý */}
            <div className="md:w-1/3">
              <h2 className="text-xl font-bold uppercase mb-4">Thông báo pháp lý</h2>
              <ul className="space-y-2 text-base">
                <li>Thông báo pháp lý</li>
                <li>Quản lý đồng ý</li>
                <li>Từ chối trách nhiệm</li>
                <li>Chính sách bảo mật</li>
                <li>Chính sách Cookie</li>
                <li>Khách sạn thành phố</li>
                <li>Khách sạn bãi biển</li>
                <li>Khách sạn gia đình</li>
              </ul>
            </div>

            {/* Cột giữa - Văn phòng trung tâm và Mạng xã hội */}
            <div className="md:w-1/3">
              <div className="mb-8">
                <h2 className="text-xl font-bold uppercase mb-4">VĂN PHÒNG TRUNG TÂM</h2>
                <p className="text-base">Tầng 19A, Số 27 Xuân Thủy,</p>
                <p className="text-base">Cầu Giấy, Hà Nội</p>
              </div>
              
              <div>
                <h2 className="text-xl font-bold uppercase mb-4">MẠNG XÃ HỘI</h2>
                <div className="flex space-x-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="w-10 h-10 bg-[#8B6F47] flex items-center justify-center hover:bg-[#A0825D] transition-colors"
                  >
                    <i className="fab fa-facebook-f text-white"></i>
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="w-10 h-10 bg-[#8B6F47] flex items-center justify-center hover:bg-[#A0825D] transition-colors"
                  >
                    <i className="fab fa-instagram text-white"></i>
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="w-10 h-10 bg-[#8B6F47] flex items-center justify-center hover:bg-[#A0825D] transition-colors"
                  >
                    <i className="fab fa-youtube text-white"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Cột phải - Hỗ trợ khách hàng */}
            <div className="md:w-1/3">
              <h2 className="text-xl font-bold uppercase mb-4">HỖ TRỢ KHÁCH HÀNG</h2>
              <ul className="space-y-2 text-base">
                <li>Liên hệ</li>
                <li>Tin tức</li>
                <li>Ưu đãi</li>
                <li>Làm việc với chúng tôi</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright bar */}
      <div className="bg-[#3a2715] text-center text-sm py-3 text-white">
        Copyright © 2025 VadiGo | Powered by B2 Performance
      </div>
    </div>
  );
};

export default Footer;
