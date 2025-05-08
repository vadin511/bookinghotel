export interface Productpayload {
    id: number;            // Khoá chính, auto-increment
  name: string;          // Tên sản phẩm
  description: string;   // Mô tả sản phẩm
  price: number;         // Giá sản phẩm
  stock: number;         // Số lượng tồn kho
  user_id: number;       // ID người thêm sản phẩm (liên kết với bảng users)
  created_at?: string;   // Thời gian tạo (optional)
  updated_at?: string;   // Thời gian cập nhật (optional)
  }
  