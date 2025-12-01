"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../../app/store/features/postSlice";
import Loading from "@/components/common/Loading";

const PostsPage = () => {
  const dispatch = useDispatch();
  const { list: posts, loading, error } = useSelector((state) => state.posts);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  // Lấy danh sách các danh mục duy nhất
  const categories = ["Tất cả", ...new Set(posts.map((post) => post.category).filter(Boolean))];

  // Lọc bài viết theo danh mục
  const filteredPosts = selectedCategory === "Tất cả" 
    ? posts 
    : posts.filter((post) => post.category === selectedCategory);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-[#5a4331] mb-4">
          Bài Viết Du Lịch
        </h1>
        <p className="text-lg text-gray-600">
          Khám phá những điểm đến tuyệt vời và kinh nghiệm du lịch hữu ích
        </p>
      </div>

      {/* Filter Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
              selectedCategory === category
                ? "bg-[#5a4331] text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading message="Đang tải bài viết..." color="indigo" size="md" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Chưa có bài viết nào.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative w-full h-48 overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#5a4331] to-[#8b6f47] flex items-center justify-center">
                    <i className="fas fa-newspaper text-white text-5xl"></i>
                  </div>
                )}
                {post.category && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#5a4331] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-bold text-[#5a4331] mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    <i className="far fa-calendar mr-1"></i>
                    {formatDate(post.created_at)}
                  </span>
                  <span className="text-[#5a4331] font-medium group-hover:text-amber-600">
                    Đọc thêm <i className="fas fa-arrow-right ml-1"></i>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsPage;

