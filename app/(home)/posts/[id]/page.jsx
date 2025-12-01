"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts } from "../../../../app/store/features/postSlice";
import Loading from "@/components/common/Loading";
import axios from "axios";

const PostDetailPage = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { list: posts } = useSelector((state) => state.posts);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data);
        
        // Lấy bài viết liên quan (cùng danh mục)
        if (res.data.category) {
          const related = posts.filter(
            (p) => p.id !== parseInt(id) && p.category === res.data.category
          );
          setRelatedPosts(related.slice(0, 3));
        } else {
          // Nếu không có danh mục, lấy bài viết mới nhất
          const related = posts.filter((p) => p.id !== parseInt(id));
          setRelatedPosts(related.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError("Không tìm thấy bài viết");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, posts]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatContent = (content) => {
    if (!content) return "";
    return content.split("\\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ));
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <Loading message="Đang tải bài viết..." color="indigo" size="md" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Không tìm thấy bài viết"}</h2>
          <Link
            href="/posts"
            className="inline-block bg-[#5a4331] text-white px-6 py-3 rounded-lg hover:bg-[#4a3320] transition-colors"
          >
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <ol className="flex items-center space-x-2 text-gray-600">
          <li>
            <Link href="/" className="hover:text-[#5a4331]">
              Trang chủ
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/posts" className="hover:text-[#5a4331]">
              Bài viết
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-800">{post.title}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Image */}
            {post.image && (
              <div className="relative w-full h-96 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6 md:p-8">
              {post.category && (
                <span className="inline-block bg-[#5a4331] text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
                  {post.category}
                </span>
              )}
              
              <h1 className="text-3xl md:text-4xl font-bold text-[#5a4331] mb-4">
                {post.title}
              </h1>

              <div className="flex items-center text-gray-500 mb-6 text-sm">
                <i className="far fa-calendar mr-2"></i>
                <span>{formatDate(post.created_at)}</span>
              </div>

              <div className="prose max-w-none text-gray-700 leading-relaxed">
                {formatContent(post.content)}
              </div>
            </div>
          </article>

          {/* Back Button */}
          <div className="mt-6">
            <Link
              href="/posts"
              className="inline-flex items-center text-[#5a4331] hover:text-amber-600 transition-colors"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>

        {/* Sidebar - Related Posts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold text-[#5a4331] mb-4">
              Bài viết liên quan
            </h2>
            
            {relatedPosts.length === 0 ? (
              <p className="text-gray-500 text-sm">Chưa có bài viết liên quan.</p>
            ) : (
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.id}
                    href={`/posts/${relatedPost.id}`}
                    className="block group"
                  >
                    <div className="flex gap-3">
                      {relatedPost.image ? (
                        <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded flex items-center justify-center">
                          <i className="fas fa-newspaper text-gray-400"></i>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#5a4331] group-hover:text-amber-600 transition-colors line-clamp-2 mb-1">
                          {relatedPost.title}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDate(relatedPost.created_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;












