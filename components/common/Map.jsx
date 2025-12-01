"use client";

const Map = ({ mapUrl, className = "" }) => {
  if (!mapUrl) {
    return (
      <div className={`w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-gray-500 text-center px-4">
          Bản đồ chưa được cập nhật
        </p>
      </div>
    );
  }

  // Hàm extract URL từ iframe HTML tag
  const extractUrlFromIframe = (html) => {
    // Kiểm tra xem có phải là thẻ iframe HTML không
    if (html.includes("<iframe") || html.includes("iframe")) {
      // Extract src từ thẻ iframe
      const srcMatch = html.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        return srcMatch[1];
      }
      // Thử cách khác: tìm src= không có quotes
      const srcMatch2 = html.match(/src=([^\s>]+)/i);
      if (srcMatch2 && srcMatch2[1]) {
        return srcMatch2[1].replace(/["']/g, "");
      }
    }
    return null;
  };

  // Hàm convert Google Maps URL sang embed URL
  const convertToEmbedUrl = (url) => {
    // Kiểm tra xem có phải là thẻ iframe HTML không
    const iframeUrl = extractUrlFromIframe(url);
    if (iframeUrl) {
      // Nếu đã extract được URL từ iframe, sử dụng URL đó
      url = iframeUrl;
    }

    // Nếu đã là embed URL, trả về trực tiếp
    if (url.includes("/embed") || url.includes("google.com/maps/embed")) {
      return url;
    }

    try {
      // Nếu là Google Maps URL, convert sang embed
      if (url.includes("google.com/maps")) {
        // Extract coordinates từ URL (format: @lat,lng)
        const coordMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        
        if (coordMatch) {
          const lat = coordMatch[1];
          const lng = coordMatch[2];
          // Sử dụng Google Maps Embed API với coordinates
          return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${lat}%2C${lng}!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s`;
        }

        // Extract place name từ URL (format: /place/...)
        const placeMatch = url.match(/place\/([^\/\?&]+)/);
        if (placeMatch) {
          // Thay thế /maps/place/ thành /maps/embed/place/
          return url.replace("/maps/place/", "/maps/embed/place/");
        }

        // Extract query parameter từ URL
        try {
          const urlObj = new URL(url);
          const q = urlObj.searchParams.get('q');
          if (q) {
            // Sử dụng cách đơn giản: thay thế /maps/ thành /maps/embed/ và giữ nguyên query
            return url.replace("/maps/", "/maps/embed/");
          }
        } catch (e) {
          // Ignore URL parsing errors
        }

        // Nếu có search parameter
        const searchMatch = url.match(/search\/([^\/\?&]+)/);
        if (searchMatch) {
          // Thay thế /maps/search/ thành /maps/embed/search/
          return url.replace("/maps/search/", "/maps/embed/search/");
        }

        // Fallback: thay thế /maps/ bằng /maps/embed/ và giữ nguyên các tham số
        if (url.includes("/maps/")) {
          return url.replace("/maps/", "/maps/embed/");
        }
      }

      // Nếu không phải Google Maps URL, trả về null để hiển thị link
      return null;
    } catch (error) {
      // Nếu có lỗi, trả về null
      return null;
    }
  };

  const embedUrl = convertToEmbedUrl(mapUrl);
  
  // Nếu không thể convert thành embed URL, hiển thị link
  if (!embedUrl) {
    return (
      <div className={`w-full ${className}`}>
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">
            Click vào nút bên dưới để xem bản đồ trên Google Maps.
          </p>
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            <i className="fas fa-map-marker-alt mr-2"></i>
            Xem trên Google Maps
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full"
          title="Bản đồ vị trí khách sạn"
        />
      </div>
    </div>
  );
};

export default Map;

