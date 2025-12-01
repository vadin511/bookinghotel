const BannerNews = () => {
  return (
    <div className="pt-[40px] pb-[40px]">
      <div className="bg-white overflow-hidden select-none">
        {/* Header Section - Dark Brown - Full width */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-[#472E1E] text-white text-center py-6 px-4">
          <p className="text-2xl md:text-3xl leading-relaxed max-w-7xl mx-auto">
            Đặt phòng qua VadiGo sẽ mở ra nhiều cơ hội cho bạn, bạn sẽ nhận được siêu nhiều ưu đãi quan trọng
          </p>
        </div>

        {/* Main Content Section - White Background */}
        <div className="bg-white p-8 md:p-12 relative min-h-[600px] md:min-h-[700px] max-w-7xl mx-auto">


          {/* Circular Dashed Path - Background, nằm trên máy bay nhưng dưới các benefit boxes */}
          <svg
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] max-w-[700px] max-h-[700px] z-[2]"
            viewBox="0 0 400 400"
            preserveAspectRatio="xMidYMid meet"
          >
            <ellipse
              cx="200"
              cy="200"
              rx="180"
              ry="180"
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeDasharray="8,4"
              opacity="0.5"
            />
          </svg>

          {/* <Image src="/images/airplane.png" alt="airplane" width={100} height={100} /> */}

          {/* Benefit 1 - Top Left */}
          <div className="absolute top-[8%] left-[8%] md:top-[5%] md:left-[10%] flex flex-col items-center max-w-[200px] md:max-w-[250px] z-10">
            <div className="bg-[#472E1E] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded mb-3 text-xl md:text-2xl font-bold">
              1
            </div>
            <p className="text-base md:text-xl text-center text-[#472E1E]">
              <strong className="block mb-2">Giá tốt nhất</strong>
              <span className="text-sm md:text-base font-normal">
                Bạn sẽ tận hưởng một kỳ nghỉ tiết kiệm hơn
              </span>
            </p>
          </div>

          {/* Benefit 2 - Bottom Left */}
          <div className="absolute bottom-[18%] left-[8%] md:bottom-[12%] md:left-[10%] flex flex-col items-center max-w-[200px] md:max-w-[250px] z-10">
            <div className="bg-[#472E1E] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded mb-3 text-xl md:text-2xl font-bold">
              2
            </div>
            <p className="text-base md:text-xl text-center text-[#472E1E]">
              <strong className="block mb-2">Hủy miễn phí trong 24h</strong>
              <span className="text-sm md:text-base font-normal">
                Nếu bạn phải hủy, hoàn toàn miễn phí cho bạn
              </span>
            </p>
          </div>

          {/* Benefit 3 - Top Right */}
          <div className="absolute top-[8%] right-[8%] md:top-[5%] md:right-[10%] flex flex-col items-center max-w-[200px] md:max-w-[250px] z-10">
            <div className="bg-[#472E1E] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded mb-3 text-xl md:text-2xl font-bold">
              3
            </div>
            <p className="text-base md:text-xl text-center text-[#472E1E]">
              <strong className="block mb-2">Phòng tốt hơn</strong>
              <span className="text-sm md:text-base font-normal">
                Nếu còn phòng trống, cho phép bạn nâng cấp hạng phòng miễn phí
              </span>
            </p>
          </div>

          {/* Benefit 4 - Bottom Right */}
          <div className="absolute bottom-[18%] right-[8%] md:bottom-[12%] md:right-[10%] flex flex-col items-center max-w-[200px] md:max-w-[250px] z-10">
            <div className="bg-[#472E1E] text-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded mb-3 text-xl md:text-2xl font-bold">
              4
            </div>
            <p className="text-base md:text-xl text-center text-[#472E1E]">
              <strong className="block mb-2">Trả phòng muộn miễn phí</strong>
              <span className="text-sm md:text-base font-normal">
                Nếu còn phòng trống, bạn có thể ra hạn thêm vài giờ
              </span>
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button
              className="bg-[#472E1E] text-white text-lg md:text-xl font-semibold rounded-lg px-6 md:px-8 py-3 hover:bg-[#3a2418] transition-colors"
              type="button"
            >
              Xem ưu đãi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerNews;
