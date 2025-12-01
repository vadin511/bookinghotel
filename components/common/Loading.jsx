"use client";

const Loading = ({ 
  message = "Đang tải dữ liệu...", 
  fullScreen = false,
  size = "md",
  color = "indigo",
  className = ""
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const colorClasses = {
    indigo: "border-indigo-600",
    amber: "border-amber-700",
    green: "border-green-600",
    blue: "border-blue-600",
    gray: "border-gray-600",
  };

  const containerClasses = fullScreen
    ? "min-h-screen bg-gray-50 flex items-center justify-center"
    : "flex items-center justify-center h-64";

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} mx-auto`}
        ></div>
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;

