"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Globe,
  Camera,
  Smile,
  Share,
  Repeat2,
  Play,
  ThumbsUp,
  MapPin,
  Eye,
} from "lucide-react";

// Social Media Icons Components
const FacebookIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const YouTubeIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export class Post {
  id: string = "";
  caption: string = "";
  body: string = "";
  hashtags: string[] = [];
  mediaUrls: string[] = [];
}

type SocialPlatform = 
  | "facebook" 
  | "instagram" 
  | "twitter" 
  | "linkedin" 
  | "tiktok" 
  | "youtube" 
  | "pinterest" 
  | "snapchat"
  | "threads"
  | "discord";

interface PostComponentProps {
  post: Post;
  userAvatar?: string;
  userName?: string;
  platform?: SocialPlatform;
  location?: string;
  timeAgo?: string;
  isVerified?: boolean;
  allowPlatformSwitch?: boolean;
}

function isImage(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

// Facebook Component
function FacebookPreview({ post, userAvatar, userName = "User", timeAgo = "2h" }: any) {
  const [showFullText, setShowFullText] = useState(false);
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-lg mx-auto">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={40} height={40} className="rounded-full" />
            ) : (
              userName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{userName}</h3>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>{timeAgo}</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-500" />
      </div>

      {post.caption && (
        <div className="px-4 pb-2">
          <h2 className="font-medium text-gray-900">{post.caption}</h2>
        </div>
      )}

      {post.body && (
        <div className="px-4 pb-3">
          <p className="text-gray-800 whitespace-pre-line">
            {showFullText || post.body.length <= 200 ? post.body : `${post.body.substring(0, 200)}...`}
            {post.body.length > 200 && (
              <button onClick={() => setShowFullText(!showFullText)} className="text-blue-600 hover:underline ml-1 font-medium">
                {showFullText ? " See less" : " See more"}
              </button>
            )}
          </p>
        </div>
      )}

      {post.mediaUrls?.length > 0 && (
        <div className="mt-3">
          <Image src={post.mediaUrls[0]} alt="Post media" width={500} height={400} className="w-full object-cover max-h-96" unoptimized />
        </div>
      )}

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>👍❤️ 24</span>
          <span>5 comments · 2 shares</span>
        </div>
      </div>

      <div className="p-2">
        <div className="flex items-center justify-around">
          <button onClick={() => setLiked(!liked)} className={`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 ${liked ? 'text-blue-600' : 'text-gray-600'}`}>
            <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-600' : ''}`} />
            <span className="font-medium">Like</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Comment</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 text-gray-600">
            <Share className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Instagram Component
function InstagramPreview({ post, userAvatar, userName = "username", timeAgo = "2h", isVerified = false }: any) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  const fullText = `${post.caption || ""} ${post.body || ""}`.trim();
  const hashtagText = post.hashtags?.map((tag: string) => `#${tag}`).join(" ") || "";
  const completeText = `${fullText} ${hashtagText}`.trim();

  return (
    <div className="bg-white border border-gray-200 rounded-lg max-w-md mx-auto shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5">
            <div className="bg-white rounded-full p-0.5">
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={28} height={28} className="rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">{userName.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-sm">{userName}</span>
              {isVerified && <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-5 h-5" />
      </div>

      {post.mediaUrls?.length > 0 && (
        <div className="relative w-full aspect-square bg-gray-100">
          <Image src={post.mediaUrls[0]} alt="Post media" fill className="object-cover" unoptimized />
        </div>
      )}

      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => setLiked(!liked)} className={`${liked ? "text-red-500" : "text-gray-800"}`}>
            <Heart className={`w-6 h-6 ${liked ? "fill-red-500" : ""}`} />
          </button>
          <MessageCircle className="w-6 h-6 text-gray-800" />
          <Send className="w-6 h-6 text-gray-800" />
        </div>
        <button onClick={() => setSaved(!saved)}>
          <Bookmark className={`w-6 h-6 ${saved ? "fill-gray-800" : ""} text-gray-800`} />
        </button>
      </div>

      <div className="px-4 pb-2">
        <span className="font-semibold text-sm">247 likes</span>
      </div>

      {completeText && (
        <div className="px-4 py-2">
          <div className="text-sm">
            <span className="font-semibold mr-2">{userName}</span>
            <span className="text-gray-800">{completeText}</span>
          </div>
        </div>
      )}

      <div className="px-4 pb-4">
        <span className="text-xs text-gray-500 uppercase">{timeAgo}</span>
      </div>
    </div>
  );
}

// Twitter Component
function TwitterPreview({ post, userAvatar, userName = "username", timeAgo = "2h", isVerified = false }: any) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg max-w-lg mx-auto p-4 hover:bg-gray-50 transition-colors">
      <div className="flex space-x-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {userAvatar ? (
            <Image src={userAvatar} alt={userName} width={48} height={48} className="rounded-full" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <span className="font-bold text-gray-900">{userName}</span>
            {isVerified && <span className="text-blue-500">✓</span>}
            <span className="text-gray-500">@{userName.toLowerCase()}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{timeAgo}</span>
          </div>
          
          <div className="mt-2">
            <p className="text-gray-900 whitespace-pre-line">
              {post.caption} {post.body}
            </p>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="mt-1">
                {post.hashtags.map((tag, idx) => (
                  <span key={idx} className="text-blue-500 hover:underline cursor-pointer mr-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {post.mediaUrls?.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
              <Image src={post.mediaUrls[0]} alt="Post media" width={500} height={300} className="w-full object-cover max-h-80" unoptimized />
            </div>
          )}

          <div className="flex items-center justify-between max-w-md mt-4 text-gray-500">
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>12</span>
            </button>
            <button onClick={() => setRetweeted(!retweeted)} className={`flex items-center space-x-2 hover:text-green-500 transition-colors ${retweeted ? 'text-green-500' : ''}`}>
              <Repeat2 className="w-5 h-5" />
              <span>5</span>
            </button>
            <button onClick={() => setLiked(!liked)} className={`flex items-center space-x-2 hover:text-red-500 transition-colors ${liked ? 'text-red-500' : ''}`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-red-500' : ''}`} />
              <span>23</span>
            </button>
            <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// LinkedIn Component
function LinkedInPreview({ post, userAvatar, userName = "User Name", timeAgo = "2h" }: any) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-300 max-w-lg mx-auto shadow-sm">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={48} height={48} className="rounded-full" />
            ) : (
              userName.split(' ').map(n => n[0]).join('').substring(0, 2)
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{userName}</h3>
            <p className="text-sm text-gray-600">Software Engineer | Tech Enthusiast</p>
            <p className="text-xs text-gray-500">{timeAgo} • 🌍</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-gray-800 leading-relaxed">{post.caption}</p>
          <p className="text-gray-800 mt-2 whitespace-pre-line">{post.body}</p>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="mt-2">
              {post.hashtags.map((tag, idx) => (
                <span key={idx} className="text-blue-600 hover:underline cursor-pointer mr-2">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {post.mediaUrls?.length > 0 && (
        <div className="border-t border-gray-200">
          <Image src={post.mediaUrls[0]} alt="Post media" width={500} height={300} className="w-full object-cover max-h-80" unoptimized />
        </div>
      )}

      <div className="border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button onClick={() => setLiked(!liked)} className={`flex items-center space-x-1 ${liked ? 'text-blue-600' : 'text-gray-600'} hover:text-blue-600 transition-colors`}>
              <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-blue-600' : ''}`} />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
              <Share className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TikTok Component
function TikTokPreview({ post, userAvatar, userName = "username", timeAgo = "2h" }: any) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="bg-black rounded-lg max-w-sm mx-auto text-white overflow-hidden">
      <div className="relative aspect-[9/16] bg-gray-900">
        {post.mediaUrls?.length > 0 ? (
          <div className="relative w-full h-full">
            <Image src={post.mediaUrls[0]} alt="TikTok video" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <span className="text-black text-sm font-bold">{userName[0].toUpperCase()}</span>
                </div>
                <span className="font-semibold">@{userName}</span>
                <span className="text-gray-300">{timeAgo}</span>
              </div>
              <p className="text-sm mb-2">{post.caption} {post.body}</p>
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, idx) => (
                    <span key={idx} className="text-sm text-gray-300">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white opacity-80" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="absolute right-4 bottom-20 flex flex-col space-y-4">
        <button onClick={() => setLiked(!liked)} className="flex flex-col items-center">
          <Heart className={`w-8 h-8 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          <span className="text-xs mt-1">127</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <MessageCircle className="w-8 h-8" />
          <span className="text-xs mt-1">45</span>
        </button>
        <button className="flex flex-col items-center text-white">
          <Share className="w-8 h-8" />
          <span className="text-xs mt-1">Share</span>
        </button>
      </div>
    </div>
  );
}

// YouTube Component
function YouTubePreview({ post, userAvatar, userName = "Channel Name", timeAgo = "2 hours ago" }: any) {
  return (
    <div className="bg-white rounded-lg max-w-md mx-auto shadow-sm">
      <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
        {post.mediaUrls?.length > 0 ? (
          <div className="relative w-full h-full">
            <Image src={post.mediaUrls[0]} alt="YouTube thumbnail" fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/20" />
            <Play className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white bg-red-600 rounded-full p-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Play className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {post.caption || "Video Title"}
        </h3>
        
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-medium">
            {userAvatar ? (
              <Image src={userAvatar} alt={userName} width={36} height={36} className="rounded-full" />
            ) : (
              userName.charAt(0)
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">{userName}</p>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>1.2K views</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {post.body && (
          <p className="text-sm text-gray-600 mt-3 line-clamp-2">{post.body}</p>
        )}
      </div>
    </div>
  );
}

// Main PostComponent
export function PostComponent({
  post,
  userAvatar,
  userName,
  platform = "facebook",
  location,
  timeAgo,
  isVerified,
  allowPlatformSwitch = true,
}: PostComponentProps) {
  const [currentPlatform, setCurrentPlatform] = useState<SocialPlatform>(platform);

  const platformOptions: { value: SocialPlatform; label: string; color: string; icon: React.ReactNode }[] = [
    { value: "facebook", label: "Facebook", color: "text-blue-600", icon: <FacebookIcon /> },
    { value: "instagram", label: "Instagram", color: "text-pink-500", icon: <InstagramIcon /> },
    { value: "tiktok", label: "TikTok", color: "text-black", icon: <TikTokIcon /> },
    // { value: "twitter", label: "Twitter", color: "text-sky-500", icon: <TwitterIcon /> },
    // { value: "linkedin", label: "LinkedIn", color: "text-blue-700", icon: <LinkedInIcon /> },
    // { value: "youtube", label: "YouTube", color: "text-red-600", icon: <YouTubeIcon /> },
  ];

  const renderPreview = () => {
    const props = { post, userAvatar, userName, timeAgo, isVerified, location };
    
    switch (currentPlatform) {
      case "facebook":
        return <FacebookPreview {...props} />;
      case "instagram":
        return <InstagramPreview {...props} />;
      case "twitter":
        return <TwitterPreview {...props} />;
      case "linkedin":
        return <LinkedInPreview {...props} />;
      case "tiktok":
        return <TikTokPreview {...props} />;
      case "youtube":
        return <YouTubePreview {...props} />;
      default:
        return <FacebookPreview {...props} />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {allowPlatformSwitch && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {platformOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCurrentPlatform(option.value)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                  currentPlatform === option.value
                    ? "border-blue-500 bg-blue-50 shadow-md transform scale-105"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className={`mb-2 transition-colors ${
                  currentPlatform === option.value ? option.color : "text-gray-400"
                }`}>
                  {option.icon}
                </div>
                <span className={`text-xs font-medium transition-colors ${
                  currentPlatform === option.value ? "text-blue-700" : "text-gray-700"
                }`}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="transition-all duration-300 ease-in-out">
        {renderPreview()}
      </div>

      {/* Post Data Display */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Post Data:</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>ID:</strong> {post.id || "N/A"}</div>
          <div><strong>Caption:</strong> {post.caption || "N/A"}</div>
          <div><strong>Body:</strong> {post.body || "N/A"}</div>
          <div><strong>Hashtags:</strong> {post.hashtags?.join(", ") || "N/A"}</div>
          <div><strong>Media URLs:</strong> {post.mediaUrls?.length || 0} items</div>
        </div>
      </div>
    </div>
  );
}