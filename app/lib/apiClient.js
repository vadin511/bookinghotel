// app/lib/apiClient.js
// Helper function để gọi API và tự động refresh token khi cần

export async function apiCall(url, options = {}) {
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  let response = await fetch(url, { ...defaultOptions, ...options });

  // Nếu access token hết hạn (401), thử refresh token
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        // Token đã được refresh, thử lại request ban đầu
        response = await fetch(url, { ...defaultOptions, ...options });
      } else {
        // Refresh token cũng hết hạn, redirect về login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Phiên đăng nhập đã hết hạn");
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw error;
    }
  }

  return response;
}














