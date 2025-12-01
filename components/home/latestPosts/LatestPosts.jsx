"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../../app/store/features/postSlice";

const LatestPosts = () => {
  const dispatch = useDispatch();
  const { list: posts, loading } = useSelector((state) => state.posts);

  useEffect(() => {
    if (posts.length === 0) {
      dispatch(fetchPosts());
    }
  }, [dispatch, posts.length]);

  // Lấy 3 bài viết mới nhất
  const latestPosts = posts.slice(0, 3);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading || latestPosts.length === 0) {
    return null;
  }

  return (
    <div className="pt-[40px] pb-[40px] max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-[#5a4331] mb-4">
          Bài Viết Mới Nhất
        </h2>
        <p className="text-lg text-gray-600">
          Khám phá những bài viết du lịch hữu ích và thú vị
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {latestPosts.map((post) => (
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
                  <i className="fas fa-newspaper text-white text-4xl"></i>
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
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
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

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link
          href="/posts"
          className="inline-block bg-[#5a4331] text-white px-8 py-3 rounded-lg hover:bg-[#4a3320] transition-colors font-medium"
        >
          Xem Tất Cả Bài Viết
        </Link>
      </div>
    </div>
  );
};

export default LatestPosts;












