import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Image, Hash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialPost } from './types';

export default function RecentPosts({ posts, isLoading }: { posts: SocialPost[], isLoading: boolean }) {
  const postTypeColors = {
    daily_special: "bg-blue-100 text-blue-800",
    seasonal_promotion: "bg-green-100 text-green-800",
    event_announcement: "bg-purple-100 text-purple-800",
    behind_scenes: "bg-yellow-100 text-yellow-800",
    customer_spotlight: "bg-pink-100 text-pink-800",
    menu_highlight: "bg-indigo-100 text-indigo-800",
    holiday_themed: "bg-red-100 text-red-800",
    community_engagement: "bg-gray-100 text-gray-800"
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-amber-100 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 border border-amber-100 rounded-lg hover:bg-amber-50/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900 truncate flex-1 mr-4">
                    {post.content}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.scheduledDate), 'MMM d')}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary"
                    className={`${postTypeColors[post.postType as keyof typeof postTypeColors] || 'bg-gray-100 text-gray-800'} text-xs`}
                  >
                    {post.postType?.replace(/_/g, ' ')}
                  </Badge>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {post.imageUrl && (
                      <div className="flex items-center gap-1">
                        <Image className="w-3 h-3" alt="icon" />
                        <span>Image</span>
                      </div>
                    )}
                    {post.content?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span>{post.content.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}