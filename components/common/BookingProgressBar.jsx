"use client";

const BookingProgressBar = ({ currentStep }) => {
  const steps = [
    { id: 1, label: "Bạn chọn", key: "select" },
    { id: 2, label: "Chi tiết về bạn", key: "details" },
    { id: 3, label: "Xác nhận đặt phòng", key: "confirm" },
    { id: 4, label: "Thanh toán", key: "payment" },
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) {
      return "completed";
    } else if (stepId === currentStep) {
      return "active";
    } else {
      return "pending";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-6 px-4">
      <div className="flex items-center justify-between relative">
        {/* Line connecting steps */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0">
          <div
            className="h-full bg-amber-700 transition-all duration-300"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isLast = index === steps.length - 1;

          return (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10 flex-1"
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  status === "completed"
                    ? "bg-amber-700 text-white"
                    : status === "active"
                    ? "bg-amber-700 text-white ring-2 ring-amber-300"
                    : "bg-gray-300 text-gray-500"
                }`}
              >
                {status === "completed" ? (
                  <i className="fas fa-check text-white text-xs"></i>
                ) : (
                  <span className="text-xs">{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-2 text-center">
                <span
                  className={`font-medium text-xs md:text-sm ${
                    status === "completed" || status === "active"
                      ? "text-[#5a4330]"
                      : "text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BookingProgressBar;

