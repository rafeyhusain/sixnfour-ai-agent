import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isTomorrow, isThisWeek } from "date-fns";
import { Clock, Calendar, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SocialPost } from './types';
import Image from 'next/image';
  
export default function UpcomingPosts({ posts, isLoading }: { posts: SocialPost[], isLoading: boolean }) {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return { label: "Today", color: "bg-green-100 text-green-800" };
    if (isTomorrow(date)) return { label: "Tomorrow", color: "bg-blue-100 text-blue-800" };
    if (isThisWeek(date)) return { label: "This Week", color: "bg-purple-100 text-purple-800" };
    return { label: format(date, 'MMM d'), color: "bg-gray-100 text-gray-800" };
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Clock className="w-5 h-5 text-amber-600" />
          Upcoming Posts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-3 border border-amber-100 rounded-lg">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : (
            posts.map((post) => {
              const postDate = new Date(post.scheduledDate);
              const dateInfo = getDateLabel(postDate);
              
              return (
                <div key={post.id} className="flex items-start gap-4 p-3 border border-amber-100 rounded-lg hover:bg-amber-50/50 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {post.imageUrl ? (
                      <Image 
                        src={post.imageUrl} 
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Calendar className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={`${dateInfo.color} text-xs`}>
                        {dateInfo.label}
                      </Badge>
                      {isToday(postDate) && (
                        <Zap className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    
                    <h4 className="font-medium text-gray-900 truncate mb-1">
                      {post.content}
                    </h4>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {post.content}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}