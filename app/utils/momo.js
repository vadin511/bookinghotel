import crypto from "crypto";

// Cấu hình MoMo Payment v2
const MOMO_CONFIG = {
  // API v2 endpoint
  MomoApiUrl: "https://test-payment.momo.vn/v2/gateway/api/create",
  SecretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  AccessKey: "F8BBA842ECF85",
  PartnerCode: "MOMO",
  PartnerName: "Booking Hotel", // Tên đối tác
  StoreId: "BookingHotel", // ID cửa hàng
};

/**
 * Tạo chữ ký HMAC SHA256 cho MoMo Payment
 * @param {string} rawSignature - Chuỗi cần ký
 * @returns {string} - Chữ ký HMAC SHA256
 */
export function createSignature(rawSignature) {
  return crypto
    .createHmac("sha256", MOMO_CONFIG.SecretKey)
    .update(rawSignature)
    .digest("hex");
}

/**
 * Tạo payment request cho MoMo v2
 * @param {Object} params - Thông tin thanh toán
 * @param {string} params.orderId - Mã đơn hàng
 * @param {number} params.amount - Số tiền
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.redirectUrl - URL trả về sau khi thanh toán
 * @param {string} params.ipnUrl - URL nhận IPN từ MoMo
 * @param {string} params.extraData - Dữ liệu bổ sung (JSON string, sẽ được encode base64)
 * @returns {Object} - Payment request data
 */
export function createPaymentRequest({
  orderId,
  amount,
  orderInfo,
  redirectUrl,
  ipnUrl,
  extraData = "",
}) {
  // Tạo requestId duy nhất
  const requestId = `${MOMO_CONFIG.PartnerCode}${Date.now()}`;

  // Validate URLs
  if (!redirectUrl || !ipnUrl) {
    throw new Error("redirectUrl và ipnUrl không được để trống");
  }

  // Encode extraData thành base64 nếu có
  let encodedExtraData = "";
  if (extraData) {
    try {
      // Kiểm tra xem extraData đã là base64 chưa
      // Nếu là base64, sử dụng trực tiếp
      // Nếu không, encode nó thành base64
      const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(extraData) && extraData.length > 0;
      
      if (isBase64 && extraData.length % 4 === 0) {
        // Có thể là base64, thử decode để kiểm tra
        try {
          Buffer.from(extraData, "base64").toString("utf8");
          // Nếu decode được, có nghĩa là đã là base64
          encodedExtraData = extraData;
        } catch {
          // Nếu không decode được, coi như là JSON string và encode
          encodedExtraData = Buffer.from(extraData, "utf8").toString("base64");
        }
      } else {
        // Không phải base64, encode nó thành base64
        encodedExtraData = Buffer.from(extraData, "utf8").toString("base64");
      }
    } catch (e) {
      console.error("Error encoding extraData:", e);
      encodedExtraData = "";
    }
  }

  // Chuyển amount thành string (theo yêu cầu của MoMo v2)
  const amountStr = String(amount);

  // Validate URLs trước khi tạo request data
  const redirectUrlStr = String(redirectUrl).trim();
  const ipnUrlStr = String(ipnUrl).trim();

  if (!redirectUrlStr || redirectUrlStr === "" || redirectUrlStr === "undefined") {
    throw new Error(`redirectUrl không hợp lệ: ${redirectUrlStr}`);
  }

  if (!ipnUrlStr || ipnUrlStr === "" || ipnUrlStr === "undefined") {
    throw new Error(`ipnUrl không hợp lệ: ${ipnUrlStr}`);
  }

  // Tạo raw signature cho MoMo v2
  // Theo error message từ MoMo: signature KHÔNG bao gồm partnerName và storeId
  // Signature chỉ bao gồm: accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType
  const requestType = "captureWallet";
  const rawSignature = `accessKey=${MOMO_CONFIG.AccessKey}&amount=${amountStr}&extraData=${encodedExtraData}&ipnUrl=${ipnUrlStr}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.PartnerCode}&redirectUrl=${redirectUrlStr}&requestId=${requestId}&requestType=${requestType}`;

  // Log raw signature để debug (không log trong production)
  if (process.env.NODE_ENV !== "production") {
    console.log("MoMo v2 raw signature:", rawSignature);
    console.log("MoMo v2 signature params:", {
      accessKey: MOMO_CONFIG.AccessKey,
      amount: amountStr,
      extraData: encodedExtraData,
      ipnUrl: ipnUrlStr,
      orderId: orderId,
      orderInfo: orderInfo,
      partnerCode: MOMO_CONFIG.PartnerCode,
      redirectUrl: redirectUrlStr,
      requestId: requestId,
      requestType: requestType,
    });
  }

  // Tạo signature
  const signature = createSignature(rawSignature);

  // Tạo request data cho MoMo v2
  // Lưu ý: partnerName và storeId có trong request body nhưng KHÔNG có trong signature
  const requestData = {
    partnerCode: MOMO_CONFIG.PartnerCode,
    partnerName: MOMO_CONFIG.PartnerName,
    storeId: MOMO_CONFIG.StoreId,
    requestId: requestId,
    amount: amountStr, // Sử dụng string
    orderId: String(orderId),
    orderInfo: String(orderInfo),
    redirectUrl: redirectUrlStr,
    ipnUrl: ipnUrlStr,
    extraData: encodedExtraData, // Sử dụng base64 encoded
    requestType: requestType, // MoMo v2 sử dụng captureWallet
    autoCapture: true,
    lang: "vi",
    signature: signature,
  };

  // Log request data để debug
  console.log("MoMo v2 request data before sending:", {
    redirectUrl: requestData.redirectUrl,
    ipnUrl: requestData.ipnUrl,
    redirectUrlLength: requestData.redirectUrl.length,
    ipnUrlLength: requestData.ipnUrl.length,
    hasRedirectUrl: !!requestData.redirectUrl,
    hasIpnUrl: !!requestData.ipnUrl,
    partnerName: requestData.partnerName,
    storeId: requestData.storeId,
  });

  return requestData;
}

/**
 * Xác thực chữ ký từ MoMo callback/IPN
 * @param {Object} params - Thông tin từ MoMo
 * @param {string} params.amount - Số tiền
 * @param {string} params.extraData - Dữ liệu bổ sung
 * @param {string} params.message - Thông báo
 * @param {string} params.orderId - Mã đơn hàng
 * @param {string} params.orderInfo - Thông tin đơn hàng
 * @param {string} params.orderType - Loại đơn hàng
 * @param {string} params.partnerCode - Mã đối tác
 * @param {string} params.payType - Loại thanh toán
 * @param {string} params.requestId - Mã request
 * @param {string} params.responseTime - Thời gian phản hồi
 * @param {string} params.resultCode - Mã kết quả
 * @param {string} params.transId - Mã giao dịch
 * @param {string} params.signature - Chữ ký từ MoMo
 * @returns {boolean} - true nếu chữ ký hợp lệ
 */
export function verifySignature({
  amount,
  extraData = "",
  message,
  orderId,
  orderInfo,
  orderType,
  partnerCode,
  payType,
  requestId,
  responseTime,
  resultCode,
  transId,
  signature,
}) {
  // MoMo trả về extraData đã được base64 encode, sử dụng trực tiếp trong signature
  // Tạo raw signature để verify
  const rawSignature = `accessKey=${MOMO_CONFIG.AccessKey}&amount=${amount}&extraData=${extraData || ""}&message=${message || ""}&orderId=${orderId}&orderInfo=${orderInfo || ""}&orderType=${orderType || ""}&partnerCode=${partnerCode}&payType=${payType || ""}&requestId=${requestId || ""}&responseTime=${responseTime || ""}&resultCode=${resultCode}&transId=${transId}`;

  // Tạo signature từ raw signature
  const calculatedSignature = createSignature(rawSignature);

  // So sánh signature
  return calculatedSignature === signature;
}

/**
 * Gửi payment request đến MoMo
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @returns {Promise<Object>} - Response từ MoMo
 */
export async function sendPaymentRequest(paymentData) {
  try {
    // Log request body trước khi gửi
    console.log("Sending to MoMo v2 API:", {
      url: MOMO_CONFIG.MomoApiUrl,
      redirectUrl: paymentData.redirectUrl,
      ipnUrl: paymentData.ipnUrl,
      hasRedirectUrl: !!paymentData.redirectUrl,
      hasIpnUrl: !!paymentData.ipnUrl,
      partnerName: paymentData.partnerName,
      storeId: paymentData.storeId,
    });

    const requestBody = JSON.stringify(paymentData);
    console.log("MoMo v2 request body:", requestBody);

    const response = await fetch(MOMO_CONFIG.MomoApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MoMo API HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`MoMo API error: ${response.status} ${response.statusText}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      const text = await response.text();
      console.error("MoMo API response is not JSON:", text);
      throw new Error("MoMo API returned invalid JSON response");
    }

    return data;
  } catch (error) {
    console.error("MoMo payment request error:", error);
    throw error;
  }
}

export default {
  createPaymentRequest,
  verifySignature,
  sendPaymentRequest,
  MOMO_CONFIG,
};

