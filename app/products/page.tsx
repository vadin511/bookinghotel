'use client';
import { useEffect, useState } from 'react';
import { Productpayload } from '../model/product';
import { useUser } from '../User/user';

export default function ProductsPage() {
  const [products, setProducts] = useState<Productpayload[]>([]);
  const [showForm, setShowForm] = useState(false);
 
  const [newProduct, setNewProduct] = useState<Productpayload>({
    id: 0,
    name: '',
    description: '',
    price: 0,
    stock: 0,
    user_id: 0,  
  });
  
  const {user} = useUser()
  
  
  useEffect(() => {
    fetch('/api/product')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if(user){
      await fetch('/api/product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
    }

    // Reload products list after adding new product
    fetch('/api/product')
      .then((res) => res.json())
      .then((data) => setProducts(data));

    console.log(user);
    
    setNewProduct({
      id: 0,
      name: '',
      description: '',
      price: 0,
      stock: 0,
      user_id: user?.id || 0,});
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Danh sách sản phẩm</h1>

      {/* Button to toggle add product form */}
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded-lg mb-4 hover:bg-blue-600"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? 'Hủy thêm sản phẩm' : 'Thêm sản phẩm'}
      </button>

      {/* Add Product Form */}
      {showForm && (
        <form onSubmit={handleAddProduct} className="bg-gray-100 p-4 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
            <input
              type="text"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Mô tả sản phẩm</label>
            <textarea
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              required
            />
          </div>
          <div className="mb-4 flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Giá sản phẩm</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: +e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Số lượng tồn kho</label>
              <input
                type="number"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: +e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
          >
            Thêm sản phẩm
          </button>
        </form>
      )}

      {/* Product List */}
      <ul className="space-y-4">
        {products.map((product) => (
          <li key={product.id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="mt-2 text-gray-900">
              <strong>Giá: </strong>{product.price} VND
            </div>
            <div className="mt-2 text-gray-700">
              <strong>Số lượng tồn: </strong>{product.stock}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
